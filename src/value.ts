/**
 * Type for event handlers that can be synchronous or asynchronous.
 * @template T The data type for the event
 * @param data - Data to handle
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Type for cleanup functions.
 */
export type CleanupFunction = () => void;

/**
 * Base interface for all observable types
 */
export interface Observable<T> {
  observe(handler: EventHandler<T>): () => void;
}

/**
 * Represents a value that can be observed for changes.
 * Notifies observers whenever the value is updated.
 *
 * @template T The type of value being stored and observed
 */
export class ObservableValue<T> implements Observable<T> {
  /** The current value being stored */
  private v: T;

  /** Event handlers */
  private handlers = new Set<EventHandler<T>>();

  /** Cleanup functions */
  private cleanups: CleanupFunction[] = [];

  /**
   * Creates a new ObservableValue instance.
   * @param initial - The initial value to store
   */
  constructor(initial: T) {
    this.v = initial;
  }

  /**
   * Get the current value.
   * @returns {T} The current stored value
   */
  get value(): T {
    return this.v;
  }

  /**
   * Set a new value, and update observers.
   * @param newValue - The new value to store
   */
  set value(v: T) {
    if (!Object.is(this.v, v)) {
      this.v = v;
      this.handlers.forEach((fn) => fn(v));
    }
  }

  /**
   * Subscribes to value changes.
   * @param fn - Function to be called with the current value and subsequent changes
   * @returns A cleanup function that removes the event handler
   */
  observe(fn: (value: T) => void): CleanupFunction {
    this.handlers.add(fn);
    return () => this.handlers.delete(fn);
  }

  /**
   * Returns the number of active observers.
   * @returns The number of active observers
   */
  observerCount(): number {
    return this.handlers.size;
  }

  /**
   * Creates a derived ObservableValue that updates whenever this one changes.
   * @template U The type of the derived value
   * @param transform - Function to transform the value
   * @returns {ObservableValue<U>} A new ObservableValue instance
   */
  derive<U>(transform: (value: T) => U): ObservableValue<U> {
    const derived = new ObservableValue<U>(transform(this.v));
    this.addCleanup(this.observe((value) => (derived.value = transform(value))));
    return derived;
  }

  /**
   * Creates a computed observable value that automatically updates when its dependencies change.
   *
   * The compute function is called immediately and whenever any dependency changes.
   * Returns a new ComputedValue that can be used like any other observable.
   *
   * @template T - The return type of the computed value
   *
   * @param compute - Function that computes the derived value
   * @param dependencies - Array of ObservableValues that trigger recomputation when changed
   *
   * @returns A new ComputedValue containing the computed result
   */
  static computed<T>(compute: () => T, dependencies: ObservableValue<any>[]): ObservableValue<T> {
    if (dependencies.length === 0) {
      console.warn("Computed value with zero dependencies");
    }

    const computed = new ObservableValue<T>(compute());
    dependencies.forEach((dep) => computed.addCleanup(dep.observe(() => (computed.value = compute()))));
    return computed;
  }

  /**
   * Add a cleanup function.
   * @param fn - The cleanup function to call on destroy().
   */
  addCleanup(fn: CleanupFunction): void {
    this.cleanups.push(fn);
  }

  /**
   * Removes all dependency subscriptions and cleans up resources.
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
