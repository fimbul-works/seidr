import { getNextSeidrId } from "../render-context/get-next-id";
import { registerHydratingSeidr } from "../ssr/hydrate/register-hydrating-seidr";
import { getSSRScope } from "../ssr/ssr-scope";
import { type CleanupFunction, type EventHandler, SeidrError } from "../types";
import { isClient } from "../util/environment/client";
import { isServer } from "../util/environment/server";
import { scheduleUpdate } from "./scheduler";
import type { Observable, ObservableOptions } from "./types";

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

  /**
   * Creates an instance of Seidr observable.
   *
   * @param {T} initial - The initial value to store
   * @param {ObservableOptions} [options={}] - Options for this Seidr instance
   */
  constructor(
    initial: T,
    public readonly options: ObservableOptions = {},
  ) {
    this.i = String(options.id ?? getNextSeidrId());
    this.v = initial;

    // Register for hydration
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
    if (this.isDerived) {
      throw new SeidrError("Cannot set value of derived Seidr", { cause: this });
    }
    this.set(v);
  }

  /**
   * Sets a new value and notifies all observers if the value changed.
   *
   * @param {T} v - The new value to store
   */
  private set(v: T) {
    if (!Object.is(this.v, v)) {
      this.v = v;

      // Notify immediately in SSR
      if (this.options.sync || isServer()) {
        this.notify();
      } else {
        scheduleUpdate(this);
      }
    }
  }

  /**
   * Flushes pending notifications to observers.
   * Internal method used by the scheduler.
   */
  notify(): void {
    this.f.forEach((fn) => fn(this.v));
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
          throw new SeidrError(`Seidr ID must be unique`, { cause: this });
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
   * @param {ObservableOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<D>} A new Seidr instance containing the transformed value
   */
  as<D>(transformFn: (value: T) => D, options: ObservableOptions = {}) {
    const derived = new Seidr<D>(transformFn(this.v), options);
    derived.setParents([this]);
    this.c.push(this.observe((updatedValue) => derived.set(transformFn(updatedValue))));
    return derived;
  }

  /**
   * Creates a derived observable value that automatically updates when its dependencies change.
   *
   * @template D - The return type of the derived value
   *
   * @param {() => D} mergeFn - Function that merges the parent values to a new value
   * @param {Seidr[]} parents - Array of Seidrs that trigger recomputation when changed
   * @param {ObservableOptions} [options] - Options for the new derived Seidr
   * @returns {Seidr<D>} A new Seidr instance containing the derived result
   */
  static merge<D>(mergeFn: () => D, parents: Seidr[], options: ObservableOptions = {}): Seidr<D> {
    if (parents.length === 0) {
      throw new SeidrError("Merged must have at least one parent");
    }

    const merged = new Seidr<D>(mergeFn(), options);
    merged.setParents(parents);
    parents.forEach((p) => merged.c.push(p.observe(() => merged.set(mergeFn()))));
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
