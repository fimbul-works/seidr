import { getNextId } from "../render-context/get-next-id";
import { registerHydratingSeidr } from "../ssr/hydrate/register-hydrating-seidr";
import { getSSRScope } from "../ssr/ssr-scope";
import { type CleanupFunction, type EventHandler, SeidrError } from "../types";
import { isClient } from "../util/environment/browser";
import { isServer } from "../util/environment/server";

/**
 * Options for Seidr instances.
 */
export interface SeidrOptions {
  /**
   * Unique identifier for this observable
   */
  id?: any;

  /**
   * Whether to hydrate this observable from server-side data
   */
  hydrate?: boolean;
}

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
  /** @type {string} Unique identifier for this observable */
  private i: string;

  /** @type {T} The current value being stored */
  private v: T;

  /** @type {Seidr<any>[]} Parent dependencies (for derived/computed observables) */
  private p: Seidr<any>[] = [];

  /** @type {Set<EventHandler<T>>} Observers */
  private f: Set<EventHandler<T>> = new Set<EventHandler<T>>();

  /** @type {CleanupFunction[]} Cleanup functions */
  private c: CleanupFunction[] = [];

  /**
   * Creates an instance of Seidr observable.
   *
   * @param {T} initial - The initial value to store
   * @param {SeidrOptions} [options={}] - Options for this Seidr instance
   */
  constructor(
    initial: T,
    public readonly options: SeidrOptions = {},
  ) {
    this.i = String(options.id ?? getNextId());
    this.v = initial;

    // Register for hydration in browser
    if (isClient()) {
      this.register();
    }
  }

  /**
   * Gets the unique identifier for this observable.
   *
   * @type {string} Instance ID
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
   * @param {T} v - The new value to store
   */
  set value(v: T) {
    if (!Object.is(this.v, v)) {
      // console.log("update", this.id, "=", v);
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
   * @type {ReadonlyArray<Seidr<any>>} Array of parent Seidr instances (empty for root observables)
   */
  get parents(): ReadonlyArray<Seidr<any>> {
    return [...this.p];
  }

  /**
   * Registers this Seidr instance with SSR/hydration systems.
   */
  private register(): void {
    // Registr parents first
    for (const parent of this.p) {
      if (parent.id === this.id) {
        // In SSR we throw, but in the browser we just warn and return
        if (isServer()) {
          throw new SeidrError(`Seidr ID must be unique`, this);
        }
        console.warn(`Seidr ID must be unique`);
      }
      parent.register();
    }

    // Don't register if hydrate is false
    if (this.options.hydrate === false) {
      return;
    }

    if (isClient()) {
      // Client-side: register immediately for hydration
      registerHydratingSeidr(this);
    } else if (isServer()) {
      // Server-side: register with active SSR scope
      getSSRScope()?.register(this);
    }
  }

  /**
   * Subscribes to value changes with an event handler.
   * Unlike `bind`, this function will only be called when the value changes.
   *
   * @param {(value: T) => void} fn - Function to be called when the value changes
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   */
  observe(fn: (value: T) => void): CleanupFunction {
    this.register();
    this.f.add(fn);
    return () => this.f.delete(fn);
  }

  /**
   * Creates a reactive binding between this observable and a target.
   * Unlike `observe`, this function will call the handler immediately with the current value.
   *
   * @template E - The type being bound to
   * @param {E} target - The value to apply changes to
   * @param {(value: T, target: E) => void} fn - Function to bind the observable's value to the target
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
   * @template U - The type of the transformed/derived value
   *
   * @param {(value: T) => U} transform - Function that transforms the source value to the derived value
   * @param {SeidrOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<U>} A new Seidr instance containing the transformed value
   */
  as<U>(transform: (value: T) => U, options: SeidrOptions = {}): Seidr<U> {
    const derived = new Seidr<U>(transform(this.v), options);
    derived.setParents([this]);
    this.addCleanup(this.observe((value) => (derived.value = transform(value))));
    return derived;
  }

  /**
   * Creates a computed observable value that automatically updates when its dependencies change.
   *
   * @template C - The return type of the computed value
   *
   * @param {() => C} compute - Function that computes the derived value
   * @param {Seidr<any>[]} parents - Array of Seidrs that trigger recomputation when changed
   * @param {SeidrOptions} [options] - Options for the new computed Seidr
   * @returns {Seidr<C>} A new Seidr instance containing the computed result
   */
  static computed<C>(compute: () => C, parents: Seidr<any>[], options: SeidrOptions = {}): Seidr<C> {
    if (parents.length === 0) {
      console.warn("Computed value with zero dependencies");
    }

    const computed = new Seidr<C>(compute(), options);
    computed.setParents(parents);
    parents.forEach((dep) => computed.addCleanup(dep.observe(() => (computed.value = compute()))));
    return computed;
  }

  /**
   * Add a cleanup function.
   * Cleanup functions are called when the observable is destroyed.
   *
   * @param {CleanupFunction} fn - The cleanup function to register
   */
  addCleanup(fn: CleanupFunction): void {
    this.c.push(fn);
  }

  /**
   * Returns the number of active observers.
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
   * Mark this observable as derived.
   * This is used by `.as()` and `Seidr.computed()`.
   * This will register the observable for SSR/hydration.
   *
   * @param {Seidr<any>[]} parents - Array of parent Seidr instances this observable depends on
   */
  private setParents(parents: Seidr<any>[]): void {
    this.p = parents;
    this.register();
  }
}
