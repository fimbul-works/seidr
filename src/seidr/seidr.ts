import type { CleanupFunction, ErrorHandler, EventHandler } from "../types";
import { isSeidr } from "./is-seidr";

/**
 * Represents a reactive value that can be observed for changes.
 *
 * Seidr is the core reactive primitive that enables automatic UI updates and
 * state management throughout Seidr applications. It maintains an internal
 * value and notifies all observers whenever that value changes.
 *
 * @template {any} T - The type of value being stored and observed
 */
export class Seidr<T = any> {
  /**
   * @static
   * @type {boolean} Enable/disable debug logging
   * @memberof Seidr
   */
  static DEBUG: boolean = false;

  /**
   * @static
   * @private
   * @type {number} Counter used to calculate a unique ID for new Seidr instances
   * @memberof Seidr
   */
  private static ID_COUNTER: number = 0;

  /**
   * @private
   * @type {T} - Current value being stored
   * @memberof Seidr
   */
  private v: T;

  /**
   * @private
   * @type {Seidr<any>[]} - Parent dependencies (for derived/computed observables)
   * @memberof Seidr
   */
  private p: Seidr<any>[] = [];

  /**
   * @private
   * @type {Set<EventHandler<T>>} Event handlers to call whenever the stored value changes
   * @memberof Seidr
   */
  private f = new Set<EventHandler<T>>();

  /**
   * Cleanup functions.
   *
   * @private
   * @type {CleanupFunction[]}
   * @memberof Seidr
   */
  private c: CleanupFunction[] = [];

  /**
   * Creates an instance of Seidr.
   *
   * @param {T} initialvalue - The initial value to store
   * @param {string | number} [id] - Identifier for this Seidr instance (default: auto-incrementing number)
   */
  constructor(
    initialvalue: T,
    public readonly id: string | number = Seidr.ID_COUNTER++,
  ) {
    this.v = initialvalue;
    if (Seidr.DEBUG)
      console.log(
        `Seidr (${this.id}) created${this.p.length ? `(derived with ${this.p.length} parent${this.p.length > 1 ? "s" : ""})` : ""}`,
      );
  }

  /**
   * Registers this Seidr instance with SSR/hydration systems.
   *
   * **NOTICE:** This is currently not being used.
   *
   * @private
   */
  private register(): void {
    if (Seidr.DEBUG) console.warn("SSR hydration is currently not supported");

    // Register parents as well
    this.p.forEach((p) => p.register());
  }

  /**
   * @type {T} Gets the current stored value
   * @memberof Seidr
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
   * @param {T} newValue The new value to store
   * @memberof Seidr
   */
  set value(newValue: T) {
    if (!Object.is(this.v, newValue)) {
      this.v = newValue;
      this.f.forEach((fn) => fn(newValue));
    }
  }

  /**
   * Gets whether this observable is derived/computed.
   *
   * @readonly
   * @type {boolean} `true` if this is a derived observable, `false` otherwise
   * @memberof Seidr
   */
  get isDerived(): boolean {
    return this.p.length > 0;
  }

  /**
   * For derived/computed observables, this returns the array of parent
   * observables that this observable depends on. For root observables,
   * this returns an empty array.
   *
   * @readonly
   * @type {ReadonlyArray<Seidr<any>>} An array of parent Seidr observables
   * @memberof Seidr
   */
  get parents(): ReadonlyArray<Seidr<any>> {
    return this.p.slice(0);
  }

  /**
   * Subscribes to value changes with an event handler.
   *
   * The handler is called when the current value, and then
   * again whenever the value changes. Returns a cleanup function that
   * can be called to unsubscribe.
   *
   * @param {(value: T) => void} fn - Function to be called with the current value and subsequent changes
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   * @memberof Seidr
   */
  observe(fn: (value: T) => void): CleanupFunction {
    this.register();
    this.f.add(fn);
    return () => this.f.delete(fn);
  }

  /**
   * Creates a reactive binding between this observable and a target.
   *
   * The `fn` function is called immediately with the current value, and then
   * automatically called whenever the stored value changes.
   *
   * Returns a cleanup function that removes the binding when called.
   *
   * @template {object} E - The type being bound to
   *
   * @param {E} target - The value to apply changes to
   * @param {(value: T, target: E) => void} fn - Function that applies the observable's value to the target
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   * @memberof Seidr
   */
  bind<E>(target: E, fn: (value: T, target: E) => void): CleanupFunction {
    this.register();
    fn(this.v, target);
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
   * @template {any} U - The type of the transformed/derived value
   *
   * @param {(value: T) => U} transform - Function that transforms the source value to the derived value
   * @param {string | number} [id] - Options ID for the new Seidr instance
   * @returns {Seidr<U>} A new Seidr instance containing the transformed value
   * @memberof Seidr
   */
  as<U = any>(transform: (value: T) => U, id?: string | number): Seidr<U> {
    // Create a new derived Seidr<U> instance
    const derived = new Seidr<U>(transform(this.v), id);
    derived.setParents([this]);

    // Track the cleanup cleanup function from the transformations
    derived.addCleanup(this.observe((value) => (derived.value = transform(value))));
    return derived;
  }

  /**
   * Creates a computed observable value that automatically updates when its dependencies change.
   *
   * Computed observables are useful for creating values that depend on multiple
   * source observables. The computation function is called immediately and then
   * again whenever any of the dependencies change.
   *
   * @template {any} C - The return type of the computed value
   *
   * @static
   * @param {() => C} compute - Function that computes the derived value
   * @param {Seidr[]} parents - Array of Seidrs that trigger recomputation when their values change
   * @param {string | number} [id] - Options ID for the new Seidr instatnce
   * @returns {Seidr<C>} A new Seidr instance containing the computed result
   * @throws {Error} If the `parents` array does not contain Seidr instances
   * @memberof Seidr
   */
  static computed<C = any>(compute: () => C, parents: Seidr<any>[], id?: string | number): Seidr<C> {
    // Check error boundaries
    if (!Array.isArray(parents) || parents.filter((p) => !isSeidr(p)).length > 0) {
      throw new Error("Seidr.computed must have an array of Seidr instances as parents");
    }

    // Create the Seidr instance
    const computed = new Seidr<C>(compute(), id);
    computed.setParents(parents);

    // Track the cleanup cleanup function from the transformations
    parents.forEach((dep) => computed.addCleanup(dep.observe(() => (computed.value = compute()))));
    return computed;
  }

  /**
   * Returns the number of active observers subscribed to this observable.
   *
   * Useful for debugging and performance monitoring to understand how many
   * components or parts of your application are listening to changes.
   *
   * @returns {number} - The number of active observers
   * @memberof Seidr
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
   * @param {ErrorHandler} [onError] - Optional error handler
   * @memberof Seidr
   */
  destroy(onError?: ErrorHandler): void {
    this.f.clear();
    this.c.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        (onError || console.error)(error);
      }
    });
    this.c = [];
  }

  /**
   * Protected method to mark this observable as derived by prividing the parent Seidr instances.
   *
   * This method is called internally by `.as()` and `Seidr.computed()`.
   *
   * @proctected
   * @param {Seidr<any>[]} parents - Array of parent Seidr instances this observable depends on
   * @memberof Seidr
   */
  protected setParents(parents: Seidr<any>[]): void {
    this.p = parents;
    this.register();
  }

  /**
   * Adds a cleanup function that will be called when this observable is destroyed.
   *
   * Cleanup functions are essential for preventing memory leaks and ensuring
   * proper resource management. They are automatically called when destroy()
   * is invoked on this observable.
   *
   * @proctected
   * @param {() => void} fn - The cleanup function to register
   * @memberof Seidr
   */
  protected addCleanup(fn: () => void): void {
    this.c.push(fn);
  }
}
