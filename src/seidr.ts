/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param data - Data to handle
 *
 * @since 1.0.0
 *
 * @see Seidr.observe - For subscribing to observable changes
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for cleanup functions used throughout Seidr for resource management.
 *
 * Cleanup functions are returned by various Seidr APIs to allow for proper
 * resource cleanup and memory management when subscriptions, bindings, or
 * components are no longer needed.
 *
 * @since 1.0.0
 *
 * @see Seidr.destroy - For cleaning up observable resources
 * @see Seidr.bind - For reactive binding cleanup
 * @see mount - For component unmounting
 */
export type CleanupFunction = () => void;

/**
 * Base interface for all observable types in Seidr.
 *
 * This interface defines the core contract that all observable implementations
 * must follow, providing the fundamental observation and binding capabilities
 * that enable reactive programming patterns.
 *
 * @template T - The type of value being observed
 *
 * @since 1.0.0
 *
 * @see Seidr - The main observable implementation
 * @see EventHandler - For event handler type definitions
 */
export interface Observable<T> {
  /**
   * Subscribes to value changes with an event handler.
   *
   * @param handler - Function to be called with the current value and subsequent changes
   *
   * @returns A cleanup function that removes the event handler
   *
   * @since 1.0.0
   *
   * @see Seidr.observe - Implementation details
   * @see CleanupFunction - For understanding the return type
   */
  observe(handler: EventHandler<T>): CleanupFunction;

  /**
   * Creates a reactive binding between this observable and a target.
   *
   * The onChange function is called immediately with the current value, and then
   * automatically called whenever the observable changes. Should return a cleanup function
   * that removes the binding when called.
   *
   * @template E - The type being bound to
   *
   * @param target - The value to apply changes to
   * @param handler - Function that applies the observable's value to the value
   *
   * @returns A cleanup function that removes the binding when called
   *
   * @since 1.0.0
   *
   * @see Seidr.bind - Implementation details
   * @see ReactiveProps - For automatic DOM property binding
   */
  bind<E>(target: E, handler: (value: T, target: E) => void): CleanupFunction;
}

/**
 * Represents a reactive value that can be observed for changes.
 *
 * Seidr is the core reactive primitive that enables automatic UI updates and
 * state management throughout Seidr applications. It maintains an internal
 * value and notifies all observers whenever that value changes.
 *
 * Key Features:
 * - **Type Safety**: Full TypeScript support with generic type parameters
 * - **Efficient Updates**: Uses Object.is() comparison to prevent unnecessary notifications
 * - **Memory Management**: Automatic cleanup and resource management
 * - **Composable**: Supports derived values and computed observables
 * - **Bind Ready**: Integrates seamlessly with DOM element properties
 *
 * @template T - The type of value being stored and observed
 *
 * @since 1.0.0
 *
 * @see Observable - Base interface this class implements
 * @see Seidr.computed - For multi-dependency computed values
 * @see mount - For integrating with component lifecycle
 * @see ReactiveProps - For automatic DOM binding
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
export class Seidr<T> implements Observable<T> {
  /** The current value being stored */
  private v: T;

  /** Event handlers */
  private handlers = new Set<EventHandler<T>>();

  /** Cleanup functions */
  private cleanups: CleanupFunction[] = [];

  /**
   * Creates a new Seidr instance with an initial value.
   *
   * @param initial - The initial value to store
   *
   * @since 1.0.0
   */
  constructor(initial: T) {
    this.v = initial;
  }

  /**
   * Gets the current stored value.
   *
   * @returns The current stored value
   *
   * @since 1.0.0
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
   * @param v - The new value to store
   *
   * @since 1.0.0
   *
   * @see Object.is - For understanding the equality comparison
   */
  set value(v: T) {
    if (!Object.is(this.v, v)) {
      this.v = v;
      this.handlers.forEach((fn) => fn(v));
    }
  }

  /**
   * Subscribes to value changes with an event handler.
   *
   * The handler is called immediately with the current value, and then
   * again whenever the value changes. Returns a cleanup function that
   * can be called to unsubscribe.
   *
   * @param fn - Function to be called with the current value and subsequent changes
   *
   * @returns A cleanup function that removes the event handler
   *
   * @since 1.0.0
   *
   * @see CleanupFunction - For understanding the return type
   * @see bind - For reactive binding to DOM elements
   * @see as - For creating derived observables
   */
  observe(fn: (value: T) => void): CleanupFunction {
    this.handlers.add(fn);
    return () => this.handlers.delete(fn);
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
   * @param target - The value to apply changes to
   * @param onChange - Function that applies the observable's value to the target
   *
   * @returns A cleanup function that removes the binding when called
   *
   * @since 1.0.0
   *
   * @see SeidrElement.toggleClass - For reactive class binding
   * @see ReactiveProps - For automatic DOM property binding
   * @see observe - For manual observation patterns
   */
  bind<E>(target: E, onChange: (value: T, target: E) => void): CleanupFunction {
    onChange(this.value, target);
    return this.observe((value) => onChange(value, target));
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
   * @param transform - Function that transforms the source value to the derived value
   *
   * @returns A new Seidr instance containing the transformed value
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
   *
   * @since 1.0.0
   *
   * @see Seidr.computed - For multi-dependency computed values
   * @see observe - For manual reaction to value changes
   */
  as<U>(transform: (value: T) => U): Seidr<U> {
    const derived = new Seidr<U>(transform(this.v));
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
   * @template T - The return type of the computed value
   *
   * @param compute - Function that computes the derived value
   * @param dependencies - Array of Seidrs that trigger recomputation when changed
   *
   * @returns A new Seidr instance containing the computed result
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
   *
   * @since 1.0.0
   *
   * @see as - For single-dependency derived values
   * @see observe - For manual dependency tracking
   * @see CleanupFunction - For understanding resource management
   */
  static computed<T>(compute: () => T, dependencies: Seidr<any>[]): Seidr<T> {
    if (dependencies.length === 0) {
      console.warn("Computed value with zero dependencies");
    }

    const computed = new Seidr<T>(compute());
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
   * @param fn - The cleanup function to register
   *
   * @since 1.0.0
   *
   * @see destroy - For triggering cleanup functions
   * @see CleanupFunction - For understanding cleanup function types
   * @see as - For automatic derived value cleanup
   * @see bind - For reactive binding cleanup
   */
  addCleanup(fn: CleanupFunction): void {
    this.cleanups.push(fn);
  }

  /**
   * Returns the number of active observers subscribed to this observable.
   *
   * Useful for debugging and performance monitoring to understand how many
   * components or parts of your application are listening to changes.
   *
   * @returns The number of active observers
   *
   * @since 1.0.0
   *
   * @see observe - For adding observers
   * @see destroy - For removing all observers
   */
  observerCount(): number {
    return this.handlers.size;
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
   * @since 1.0.0
   *
   * @see addCleanup - For registering cleanup functions
   * @see CleanupFunction - For understanding cleanup behavior
   * @see observerCount - For checking active observers
   * @see observe - For understanding observer management
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
  destroy() {
    this.handlers.clear();
    this.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error(error);
      }
    });
    this.cleanups = [];
  }
}
