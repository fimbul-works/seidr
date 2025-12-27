import { registerHydratedSeidr } from "../ssr/hydration-context";
import { getActiveSSRScope } from "../ssr/ssr-scope";
import type { CleanupFunction, EventHandler } from "./types";
import { uid } from "./util/uid";

/**
 * Represents a reactive value that can be observed for changes.
 *
 * Seidr is the core reactive primitive that enables automatic UI updates and
 * state management throughout Seidr applications. It maintains an internal
 * value and notifies all observers whenever that value changes.
 *
 * @template T - The type of value being stored and observed
 *
 * @example
 * Basic reactive value
 * ```typescript
 * import { Seidr } from '@fimbul-works/seidr';
 *
 * const count = new Seidr(0);
 *
 * // Subscribe to changes
 * const unsubscribe = count.observe(value => {
 *   console.log('Count changed:', value);
 * });
 *
 * count.value = 5; // Logs: "Count changed: 5"
 * count.value = 5; // No notification (same value)
 *
 * unsubscribe(); // Cleanup
 * ```
 */
export class Seidr<T> {
  /** The current value being stored */
  private v: T;

  /** Unique identifier for this observable */
  private i: string = uid();

  /** Whether this is a derived/computed observable */
  private d: boolean = false;

  /** Parent dependencies (for derived/computed observables) */
  private p: Seidr<any>[] = [];

  /** Event handlers */
  private f = new Set<EventHandler<T>>();

  /** Cleanup functions */
  private c: CleanupFunction[] = [];

  /**
   * Creates an instance of Seidr.
   *
   * @param {T} initial - The initial value to store
   * @memberof Seidr
   */
  constructor(initial: T) {
    this.v = initial;

    // Server-side rendering check: window === undefined or process.env.SEIDR_TEST_SSR === true
    if (
      typeof window === "undefined" ||
      (typeof process !== "undefined" && (process.env.SEIDR_TEST_SSR || process.env.VITEST))
    ) {
      const scope = getActiveSSRScope();
      if (scope) scope.register(this);
    } else {
      // Client-side hydration check
      registerHydratedSeidr(this);
    }
  }

  /**
   * Gets the unique identifier for this observable.
   *
   * @type {string} The unique ID for this observable instance
   */
  get id(): string {
    return this.i;
  }

  /**
   * Gets the current stored value.
   *
   * @type {T} The current stored value
   */
  get value(): T {
    return this.v;
  }

  /**
   * Sets a new value and notifies all observers if the value changed.
   *
   * Uses Object.is() comparison to prevent unnecessary notifications
   * when the value is the same (including special cases like NaN).
   *
   * @param {T} v - The new value to store
   */
  set value(v: T) {
    if (!Object.is(this.v, v)) {
      this.v = v;
      this.f.forEach((fn) => fn(v));
    }
  }

  /**
   * Gets whether this observable is derived/computed.
   *
   * @type {boolean} true if this is a derived observable, false otherwise
   */
  get isDerived(): boolean {
    return this.d;
  }

  /**
   * Gets the parent dependencies of this observable.
   *
   * For derived/computed observables, this returns the array of parent
   * observables that this observable depends on. For root observables,
   * this returns an empty array.
   *
   * @type {ReadonlyArray<Seidr<any>>} Array of parent Seidr instances (empty for root observables)
   *
   * @example
   * Inspecting derived observable parents
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const firstName = new Seidr('John');
   * const lastName = new Seidr('Doe');
   *
   * const fullName = Seidr.computed(
   *   () => `${firstName.value} ${lastName.value}`,
   *   [firstName, lastName]
   * );
   *
   * console.log(fullName.parents); // [Seidr<string>, Seidr<string>]
   * console.log(fullName.parents[0] === firstName); // true
   * console.log(firstName.parents); // [] (root observable)
   * ```
   *
   * @example
   * Chained derived values
   * ```typescript
   * const count = new Seidr(5);
   * const doubled = count.as(n => n * 2);
   * const quadrupled = doubled.as(n => n * 2);
   *
   * console.log(doubled.parents); // [count]
   * console.log(quadrupled.parents); // [doubled]
   * console.log(quadrupled.parents[0].parents[0] === count); // true
   * ```
   */
  get parents(): ReadonlyArray<Seidr<any>> {
    return this.p;
  }

  /**
   * Subscribes to value changes with an event handler.
   *
   * The handler is called immediately with the current value, and then
   * again whenever the value changes. Returns a cleanup function that
   * can be called to unsubscribe.
   *
   * @param {(value: T) => void} fn - Function to be called with the current value and subsequent changes
   *
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   */
  observe(fn: (value: T) => void): CleanupFunction {
    this.f.add(fn);
    return () => this.f.delete(fn);
  }

  /**
   * Creates a reactive binding between this observable and a target.
   *
   * The onChange function is called immediately with the current value, and then
   * automatically called whenever the observable changes. Returns a cleanup function
   * that removes the binding when called.
   *
   * @template E - The type being bound to
   *
   * @param {E} target - The value to apply changes to
   * @param {(value: T, target: E) => void} fn - Function that applies the observable's value to the target
   *
   * @returns {CleanupFunction} A cleanup function that removes the binding when called
   */
  bind<E>(target: E, fn: (value: T, target: E) => void): CleanupFunction {
    fn(this.value, target);
    return this.observe((value) => fn(value, target));
  }

  /**
   * Creates a derived Seidr that automatically transforms this observable's value.
   *
   * This method returns a new Seidr observable that maintains a derived value
   * based on this observable's current value. Whenever this observable changes,
   * the derived observable automatically updates with the transformed value.
   *
   * The transformation function is called immediately with the current value,
   * and then called again whenever this observable's value changes.
   *
   * @template U - The type of the transformed/derived value
   *
   * @param {(value: T) => U} transform - Function that transforms the source value to the derived value
   * @returns {Seidr<U>} A new Seidr instance containing the transformed value
   *
   * @example
   * Simple numeric transformation
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const count = new Seidr(5);
   * const doubled = count.as(n => n * 2); // Seidr<number> with value 10
   * const isEven = count.as(n => n % 2 === 0); // Seidr<boolean> with value false
   *
   * console.log(doubled.value); // 10
   * console.log(isEven.value); // false
   *
   * count.value = 6;
   * console.log(doubled.value); // 12
   * console.log(isEven.value); // true
   * ```
   *
   * @example
   * String formatting and concatenation
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const firstName = new Seidr('John');
   * const lastName = new Seidr('Doe');
   *
   * const fullName = firstName.as(name => `${name} ${lastName.value}`);
   * const displayName = firstName.as(name => name.toUpperCase());
   *
   * console.log(fullName.value); // "John Doe"
   * console.log(displayName.value); // "JOHN"
   *
   * firstName.value = 'Jane';
   * console.log(fullName.value); // "Jane Doe"
   * console.log(displayName.value); // "JANE"
   * ```
   *
   * @example
   * Complex object transformations
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const user = new Seidr({ id: 1, name: 'John', age: 30 });
   *
   * const userName = user.as(u => u.name);
   * const userDescription = user.as(u => `${u.name} (${u.age} years old)`);
   * const isAdult = user.as(u => u.age >= 18);
   *
   * console.log(userName.value); // "John"
   * console.log(userDescription.value); // "John (30 years old)"
   * console.log(isAdult.value); // true
   * ```
   *
   * @example
   * Array filtering and mapping
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const numbers = new Seidr([1, 2, 3, 4, 5]);
   *
   * const evenNumbers = numbers.as(nums => nums.filter(n => n % 2 === 0));
   * const squaredNumbers = numbers.as(nums => nums.map(n => n * n));
   * const count = numbers.as(nums => nums.length);
   *
   * console.log(evenNumbers.value); // [2, 4]
   * console.log(squaredNumbers.value); // [1, 4, 9, 16, 25]
   * console.log(count.value); // 5
   * ```
   *
   * @example
   * Conditional transformations
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const temperature = new Seidr(25);
   *
   * const temperatureStatus = temperature.as(temp => {
   *   if (temp < 0) return 'Freezing';
   *   if (temp < 10) return 'Cold';
   *   if (temp < 20) return 'Cool';
   *   if (temp < 30) return 'Warm';
   *   return 'Hot';
   * });
   *
   * const temperatureColor = temperature.as(temp => {
   *   if (temp < 10) return 'blue';
   *   if (temp < 20) return 'green';
   *   if (temp < 30) return 'orange';
   *   return 'red';
   * });
   *
   * console.log(temperatureStatus.value); // "Warm"
   * console.log(temperatureColor.value); // "orange"
   * ```
   */
  as<U>(transform: (value: T) => U): Seidr<U> {
    const derived = new Seidr<U>(transform(this.v));
    derived.setIsDerived(true, [this]);
    this.addCleanup(this.observe((value) => (derived.value = transform(value))));
    return derived;
  }

  /**
   * Creates a computed observable value that automatically updates when its dependencies change.
   *
   * Computed observables are useful for creating values that depend on multiple
   * source observables. The computation function is called immediately and then
   * again whenever any of the dependencies change.
   *
   * @template C - The return type of the computed value
   *
   * @param {() => C} compute - Function that computes the derived value
   * @param {Seidr<any>} dependencies - Array of Seidrs that trigger recomputation when changed
   * @returns {Seidr<C>} A new Seidr instance containing the computed result
   *
   * @example
   * Full name computation
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const firstName = new Seidr('John');
   * const lastName = new Seidr('Doe');
   *
   * const fullName = Seidr.computed(
   *   () => `${firstName.value} ${lastName.value}`,
   *   [firstName, lastName]
   * );
   *
   * console.log(fullName.value); // "John Doe"
   * firstName.value = 'Jane';
   * console.log(fullName.value); // "Jane Doe"
   * ```
   *
   * @example
   * Complex calculations
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const width = new Seidr(100);
   * const height = new Seidr(200);
   *
   * const area = Seidr.computed(
   *   () => width.value * height.value,
   *   [width, height]
   * );
   *
   * const perimeter = Seidr.computed(
   *   () => 2 * (width.value + height.value),
   *   [width, height]
   * );
   * ```
   */
  static computed<C>(compute: () => C, dependencies: Seidr<any>[]): Seidr<C> {
    if (dependencies.length === 0) {
      console.warn("Computed value with zero dependencies");
    }

    const computed = new Seidr<C>(compute());
    computed.setIsDerived(true, dependencies);
    dependencies.forEach((dep) => computed.addCleanup(dep.observe(() => (computed.value = compute()))));
    return computed;
  }

  /**
   * Adds a cleanup function that will be called when this observable is destroyed.
   *
   * Cleanup functions are essential for preventing memory leaks and ensuring
   * proper resource management. They are automatically called when destroy()
   * is invoked on this observable.
   *
   * @param {CleanupFunction} fn - The cleanup function to register
   */
  addCleanup(fn: CleanupFunction): void {
    this.c.push(fn);
  }

  /**
   * Returns the number of active observers subscribed to this observable.
   *
   * Useful for debugging and performance monitoring to understand how many
   * components or parts of your application are listening to changes.
   *
   * @returns {number} The number of active observers
   */
  observerCount(): number {
    return this.f.size;
  }

  /**
   * Removes all observers and executes all registered cleanup functions.
   *
   * This method should be called when an observable is no longer needed to
   * prevent memory leaks and ensure proper cleanup of resources. After calling
   * destroy(), the observable can no longer be used for observing changes.
   *
   * Cleanup functions are executed in a try-catch block to ensure that
   * errors in one cleanup function don't prevent others from running.
   *
   * @example
   * Manual cleanup
   * ```typescript
   * import { Seidr } from '@fimbul-works/seidr';
   *
   * const counter = new Seidr(0);
   * const unsubscribe = counter.observe(value => console.log(value));
   *
   * // When done:
   * unsubscribe(); // Remove specific observer
   * counter.destroy(); // Clean up everything
   * ```
   */
  destroy(): void {
    this.f.clear();
    this.c.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error(error);
      }
    });
    this.c = [];
  }

  /**
   * Protected method to mark this observable as derived.
   *
   * This method is called internally by `.as()` and `Seidr.computed()`.
   *
   * @param {boolean} value - Whether this observable is derived
   * @param {Seidr<any>[]} parents - Array of parent Seidr instances this observable depends on
   */
  protected setIsDerived(value: boolean, parents: Seidr<any>[]): void {
    this.d = value;
    this.p = parents;

    // Server-side rendering check: window === undefined || process.env.SEIDR_TEST_SSR === true
    if (typeof window === "undefined" || (typeof process !== "undefined" && process.env.SEIDR_TEST_SSR)) return;

    const scope = getActiveSSRScope();
    if (scope) scope.registerDerived(this, parents);
  }
}
