import { getNextId } from "../render-context/get-next-id";
import { registerHydratingSeidr } from "../ssr/hydrate/register-hydrating-seidr";
import { getSSRScope } from "../ssr/ssr-scope";
import { type CleanupFunction, type EventHandler, SeidrError } from "../types";
import { isClient } from "../util/environment/browser";
import { isServer } from "../util/environment/server";
import { isObj, isSeidr, isWeave } from "../util/type-guards";
import { weave } from "./seidr-weave";
import type { Observable, SeidrOptions, Weave } from "./types";

/**
 * Represents a reactive value that can be observed for changes.
 *
 * Seidr is the core reactive primitive that enables automatic UI updates and
 * state management throughout Seidr applications. It maintains an internal
 * value and notifies all observers whenever that value changes.
 *
 * @template T - The type of value being stored and observed
 */
export class Seidr<T = any> implements Observable<T> {
  /** @type {string} Unique identifier for this observable */
  private i: string;

  /** @type {T} The current value being stored */
  private v: T;

  /** @type {Seidr[]} Parent dependencies (for derived observables) */
  private p: Seidr[] = [];

  /** @type {Set<EventHandler<T>>} Observers */
  private f: Set<EventHandler<T>> = new Set<EventHandler<T>>();

  /** @type {CleanupFunction[]} Cleanup functions */
  private c: CleanupFunction[] = [];

  /** @type {CleanupFunction | undefined} Cleanup for internal observation of child Weave/Seidr */
  private cv: CleanupFunction | undefined;

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

    // Auto-wrap objects in Weave if they aren't already observable
    const val = isObj(initial) && !isSeidr(initial) && !isWeave(initial) ? weave(initial as object, options) : initial;

    this.v = val as T;
    this.setupInternalObservation(val);

    // Register for hydration in browser
    if (isClient() && !process.env.CORE_DISABLE_SSR) {
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
    this.set(v);
  }

  private set(v: T) {
    // Auto-wrap objects in Weave if they aren't already observable
    const val = isObj(v) && !isSeidr(v) && !isWeave(v) ? weave(v as object, this.options) : v;

    if (!Object.is(this.v, val)) {
      if (this.cv) {
        this.cv();
        this.cv = undefined;
      }

      this.v = val as T;
      this.setupInternalObservation(val);
      this.f.forEach((fn) => fn(this.v));
    }
  }

  /**
   * Sets up internal observation if the value is a Seidr or Weave.
   * This ensures that deep changes in the value trigger this Seidr's observers.
   */
  private setupInternalObservation(val: any) {
    if (isSeidr(val) || isWeave(val)) {
      this.cv = (val as any).observe(() => {
        this.f.forEach((fn) => fn(this.v));
      });
    }
  }

  /**
   * Gets whether this observable is derived.
   *
   * @type {boolean} true if this is a derived observable, false otherwise
   */
  get isDerived(): boolean {
    return this.p.length > 0;
  }

  /**
   * Gets the parent dependencies of this observable.
   *
   * @type {Seidr[]} Array of parent Seidr instances (empty for root observables)
   */
  get parents(): Seidr[] {
    return [...this.p];
  }

  /**
   * Registers this Seidr instance with SSR/hydration systems.
   */
  private register(): void {
    // Minimize bundle size by
    if (process.env.CORE_DISABLE_SSR) {
      return;
    }

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
    if (!process.env.CORE_DISABLE_SSR) {
      this.register();
    }
    this.f.add(fn);
    return () => this.f.delete(fn);
  }

  /**
   * Creates a reactive binding between this observable and a target.
   * Unlike `observe`, this function will call the handler immediately with the current value.
   *
   * @template O - The type being bound to
   * @param {O} target - The value to apply changes to
   * @param {(value: T, target: O) => void} bindFn - Function to bind the observable's value to the target
   * @returns {CleanupFunction} A cleanup function that removes the binding when called
   */
  bind<O>(target: O, bindFn: (value: T, target: O) => void): CleanupFunction {
    if (!process.env.CORE_DISABLE_SSR) {
      this.register();
    }
    bindFn(this.value, target);
    return this.observe((value) => bindFn(value, target));
  }

  /**
   * Creates a derived Seidr that automatically transforms this observable's value.
   *
   * @template D - The type of the transformed/derived value
   *
   * @param {(value: T) => D} transformFn - Function that transforms the source value to the derived value
   * @param {SeidrOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<D>} A new Seidr instance containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options: SeidrOptions = {}): D extends object ? Weave<D> | Seidr<D> : Seidr<D> {
    const value = transformFn(this.v);
    if (isObj(value)) {
      const derived = weave<typeof value>(value, options);
      this.c.push(this.observe((updatedValue) => (derived as any).set(transformFn(updatedValue))));
      return derived as D extends object ? Weave<D> | Seidr<D> : Seidr<D>;
    }
    const derived = new Seidr<D>(value, options);
    derived.setParents([this]);
    this.c.push(this.observe((updatedValue) => (derived as any).set(transformFn(updatedValue))));
    return derived as D extends object ? Weave<D> | Seidr<D> : Seidr<D>;
  }

  /**
   * Creates a derived observable value that automatically updates when its dependencies change.
   *
   * @template D - The return type of the derived value
   *
   * @param {() => D} mergeFn - Function that merges the parent values to a new value
   * @param {Seidr[]} parents - Array of Seidrs that trigger recomputation when changed
   * @param {SeidrOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<D>} A new Seidr instance containing the derived result
   */
  static merge<D>(mergeFn: () => D, parents: Seidr[], options: SeidrOptions = {}): Seidr<D> {
    if (parents.length === 0) {
      throw new SeidrError("Merged must have at least one parent");
    }

    const merged = new Seidr<D>(mergeFn(), options);
    merged.setParents(parents);
    parents.forEach((p) => merged.c.push(p.observe(() => (merged as any).set(mergeFn()))));
    return merged;
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
    if (this.cv) {
      this.cv();
      this.cv = undefined;
    }
  }

  /**
   * Returns the current state as a plain object.
   *
   * @returns {T} The current state as a plain object
   */
  toJSON(): T {
    return this.v;
  }

  /**
   * Mark this observable as derived.
   * This is used by `.as()` and `Seidr.merge()`.
   * This will register the observable for SSR/hydration.
   *
   * @param {Seidr[]} parents - Array of parent Seidr instances this observable depends on
   */
  private setParents(parents: Seidr[]): void {
    this.p = parents;
    if (!process.env.CORE_DISABLE_SSR) {
      this.register();
    }
  }
}
