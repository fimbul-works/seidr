import { getAppState, getNextSeidrId } from "../app-state/app-state";
import { type CleanupFunction, type EventHandler, SeidrError } from "../types";
import { scheduleUpdate } from "./scheduler";
import type { Observable, ObservableOptions } from "./types";

const DATA_KEY_STATE = "state";

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
  /**
   * Unique identifier for this observable.
   * @private
   * @property {string}
   */
  private i: string;

  /**
   * The current value being stored.
   * @private
   * @property {T}
   */
  private v: T;

  /** Parent dependencies (for derived observables).
   * @private
   * @property {Seidr[]}
   */
  private p: Seidr[] = [];

  /**
   * Set of event handlers subscribed to value changes.
   * @private
   * @property {Set<EventHandler<T>>}
   */
  private f: Set<EventHandler<T>> = new Set<EventHandler<T>>();

  /**
   * Cleanup functions.
   * @private
   * @property {CleanupFunction[]}
   */
  private c: CleanupFunction[] = [];

  /**
   * @type {(seidr: Seidr) => void} Register Seidr for SSR/hydration callback.
   */
  static register: (seidr: Seidr) => void;

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
    this.i = options.id ?? getNextSeidrId();
    this.v = initial;

    // If an ID is provided in options, check if the Seidr instance is already registered in the current AppState
    if (options.id) {
      try {
        const appState = getAppState();
        const states = appState.getData<Record<string, Seidr>>(DATA_KEY_STATE) ?? {};
        if (states?.[options.id]) {
          // biome-ignore lint/correctness/noConstructorReturn: Seidr ID are unique
          return states[options.id] as Seidr<T>;
        }
      } catch {
        // Ignore if no AppState (e.g. outside of runWithAppState), will register for SSR/hydration if scope is active
      }
    }

    if (!process.env.DISABLE_SSR) {
      Seidr.register?.(this);
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
   * Subscribes to value changes with an event handler.
   * Unlike `bind`, this function will only be called when the value changes.
   *
   * @param {(value: T) => void} fn - Function to be called when the value changes
   * @returns {CleanupFunction} A cleanup function that removes the event handler
   */
  observe(fn: (value: T) => void): CleanupFunction {
    if (!process.env.DISABLE_SSR) {
      Seidr.register?.(this);
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
    if (!process.env.DISABLE_SSR) {
      Seidr.register?.(this);
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
   * Flushes pending notifications to observers.
   * Internal method used by the scheduler.
   *
   * @internal
   */
  notify(): void {
    this.f.forEach((fn) => fn(this.v));
  }

  /**
   * Removes all observers and executes all registered cleanup functions.
   */
  destroy(): void {
    this.f.clear();
    this.c.forEach((cleanup) => cleanup());
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
   * Sets a new value and notifies all observers if the value changed.
   *
   * @private
   * @param {T} v - The new value to store
   */
  private set(v: T) {
    if (!Object.is(this.v, v)) {
      this.v = v;

      if (!process.env.USE_SCHEDULER) {
        this.notify();
      } else if (this.options.sync) {
        this.notify();
      } else {
        scheduleUpdate(this);
      }
    }
  }

  /**
   * Mark this observable as derived.
   * This is used by `.as()` and `Seidr.merge()`.
   * This will register the observable for SSR/hydration.
   *
   * @private
   * @param {Seidr[]} parents - Array of parent Seidr instances this observable depends on
   */
  private setParents(parents: Seidr[]): void {
    this.p = parents;
    if (!process.env.DISABLE_SSR) {
      Seidr.register?.(this);
    }
  }
}
