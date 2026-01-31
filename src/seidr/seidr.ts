import { getRenderContext } from "../render-context";
import { registerHydratedSeidr } from "../ssr/hydration-context";
import { getActiveSSRScope } from "../ssr/ssr-scope";
import type { CleanupFunction, ErrorHandler, EventHandler } from "../types";
import { wrapError } from "../util/wrap-error";

let seidrIdCounter: number = 0;

/** Generates a unique numeric ID for a Seidr instance within the current render context */
const generateSeidrId = (): number => {
  if (typeof window !== "undefined") {
    return seidrIdCounter++;
  }
  return getRenderContext().seidrIdCounter++;
};

/**
 * Represents a reactive value that can be observed for changes.
 *
 * Seidr is the core reactive primitive that enables automatic UI updates and
 * state management throughout Seidr applications. It maintains an internal
 * value and notifies all observers whenever that value changes.
 *
 * @template T - The type of value being stored and observed
 */
export class Seidr<T> {
  /** @type {T} The current value being stored */
  private v: T;

  /** @type {number} Unique identifier for this observable (for debugging) */
  private i: number = generateSeidrId();

  /** @type {Seidr<any>[]} Parent dependencies (for derived/computed observables) */
  private p: Seidr<any>[] = [];

  /** @type {Set<EventHandler<T>>} Event handlers */
  private f = new Set<EventHandler<T>>();

  /** @type {CleanupFunction[]} Cleanup functions */
  private c: CleanupFunction[] = [];

  /**
   * Creates an instance of Seidr.
   *
   * @param {T} initial - The initial value to store
   * @param {{ hydrate?: boolean; id?: string }} [options] - Options for this Seidr instance
   */
  constructor(
    initial: T,
    public readonly options: { hydrate?: boolean; id?: string } = {},
  ) {
    this.v = initial;

    // Client-side: register immediately for hydration
    // (Server-side: registration happens on first observe/bind)
    if (typeof window !== "undefined" && typeof process !== "undefined") {
      registerHydratedSeidr(this);
    }
  }

  /**
   * Registers this Seidr instance with SSR/hydration systems.
   *
   * On server-side (SSR): Called automatically on first observe/bind to ensure
   * registration happens in the same order on server and client, and allows
   * Seidr instances to be created outside renderToString but used inside it.
   *
   * On client-side: Called in constructor for immediate hydration registration.
   */
  private register(): void {
    // If hydration is explicitly disabled, skip registration
    if (this.options.hydrate === false) {
      return;
    }

    // Server-side rendering check: window === undefined or process.env.SEIDR_TEST_SSR === true
    if (
      typeof window === "undefined" ||
      (typeof process !== "undefined" && (process.env.SEIDR_TEST_SSR || process.env.VITEST))
    ) {
      const scope = getActiveSSRScope();
      if (scope) scope.register(this);
    }
  }

  /**
   * Gets the unique identifier for this observable.
   *
   * @type {number} The unique ID for this observable instance (for debugging)
   */
  get id(): number {
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
    return this.p.length > 0;
  }

  /**
   * Gets the parent dependencies of this observable.
   *
   * For derived/computed observables, this returns the array of parent
   * observables that this observable depends on. For root observables,
   * this returns an empty array.
   *
   * @type {ReadonlyArray<Seidr<any>>} Array of parent Seidr instances (empty for root observables)
   */
  get parents(): ReadonlyArray<Seidr<any>> {
    return this.p.slice(0);
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
    this.register();
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
    this.register();
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
   * @param {{ hydrate?: boolean }} [options] - Options for the new derived Seidr
   * @returns {Seidr<U>} A new Seidr instance containing the transformed value
   */
  as<U>(transform: (value: T) => U, options: { hydrate?: boolean } = {}): Seidr<U> {
    const derived = new Seidr<U>(transform(this.v), options);
    derived.setParents([this]);
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
   * @param {Seidr<any>[]} parents - Array of Seidrs that trigger recomputation when changed
   * @param {{ hydrate?: boolean }} [options] - Options for the new computed Seidr
   * @returns {Seidr<C>} A new Seidr instance containing the computed result
   */
  static computed<C>(compute: () => C, parents: Seidr<any>[], options: { hydrate?: boolean } = {}): Seidr<C> {
    if (parents.length === 0) {
      console.warn("Computed value with zero dependencies");
    }

    const computed = new Seidr<C>(compute(), options);
    computed.setParents(parents);
    parents.forEach((dep) => computed.addCleanup(dep.observe(() => (computed.value = compute()))));
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
   */
  destroy(onError?: ErrorHandler): void {
    this.f.clear();
    this.c.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        (onError ?? console.error)(wrapError(error));
      }
    });
    this.c = [];
  }

  /**
   * Protected method to mark this observable as derived.
   *
   * This method is called internally by `.as()` and `Seidr.computed()`.
   *
   * @param {Seidr<any>[]} parents - Array of parent Seidr instances this observable depends on
   */
  protected setParents(parents: Seidr<any>[]): void {
    this.p = parents;

    // Register this derived Seidr with SSR scope (happens when .as() or .computed() is called)
    this.register();

    // Also register all parents to ensure they're in the SSR scope
    // This handles cases where parents are created outside renderToString but used inside it
    parents.forEach((parent) => parent.register());
  }
}
