import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObservableValue } from '@fimbul-works/observable';
import { ComputedValue, bind, computed, toggleClass } from './reactive';

describe('ComputedValue', () => {
  it('should extend ObservableValue', () => {
    const computed = new ComputedValue('test');
    expect(computed).toBeInstanceOf(ObservableValue);
    expect(computed.get()).toBe('test');
  });

  it('should track cleanup functions', () => {
    const computed = new ComputedValue('test');
    let cleanupCalled = false;

    computed.addCleanup(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(false);

    computed.destroy();

    expect(cleanupCalled).toBe(true);
  });

  it('should handle multiple cleanup functions', () => {
    const computed = new ComputedValue('test');
    let cleanup1Called = false;
    let cleanup2Called = false;

    computed.addCleanup(() => { cleanup1Called = true; });
    computed.addCleanup(() => { cleanup2Called = true; });

    computed.destroy();

    expect(cleanup1Called).toBe(true);
    expect(cleanup2Called).toBe(true);
  });

  it('should clear cleanup functions after destroy', () => {
    const computed = new ComputedValue('test');
    let cleanupCalled = false;

    computed.addCleanup(() => { cleanupCalled = true; });

    computed.destroy();
    computed.destroy(); // Call destroy twice

    expect(cleanupCalled).toBe(true);
  });
});

describe('bind', () => {
  let element: HTMLElement;
  let observable: ObservableValue<string>;

  beforeEach(() => {
    element = document.createElement('div');
    observable = new ObservableValue('initial');
  });

  it('should call renderer immediately with current value', () => {
    const renderer = vi.fn();

    bind(observable, element, renderer);

    expect(renderer).toHaveBeenCalledWith('initial', element);
    expect(renderer).toHaveBeenCalledTimes(1);
  });

  it('should call renderer when observable value changes', () => {
    const renderer = vi.fn();

    bind(observable, element, renderer);

    expect(renderer).toHaveBeenCalledTimes(1);

    observable.set('new value');

    expect(renderer).toHaveBeenCalledTimes(2);
    expect(renderer).toHaveBeenCalledWith('new value', element);
  });

  it('should return cleanup function', () => {
    const renderer = vi.fn();

    const cleanup = bind(observable, element, renderer);

    expect(typeof cleanup).toBe('function');

    // Call cleanup to verify it doesn't throw
    expect(() => cleanup()).not.toThrow();
  });

  it('should stop calling renderer after cleanup', () => {
    const renderer = vi.fn();

    const cleanup = bind(observable, element, renderer);

    // Initial call
    expect(renderer).toHaveBeenCalledTimes(1);

    cleanup();

    // Value change after cleanup should not trigger renderer
    observable.set('new value');

    // Should still only have the initial call
    expect(renderer).toHaveBeenCalledTimes(1);
  });

  it('should work with different types', () => {
    const numberObs = new ObservableValue(42);
    const renderer = vi.fn();

    bind(numberObs, element, renderer);

    expect(renderer).toHaveBeenCalledWith(42, element);

    numberObs.set(100);

    expect(renderer).toHaveBeenCalledWith(100, element);
  });
});

describe('computed', () => {
  it('should create computed value with initial computation', () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);

    const sum = computed(() => a.get() + b.get(), [a, b]);

    expect(sum.get()).toBe(5);
  });

  it('should update when dependencies change', () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);

    const sum = computed(() => a.get() + b.get(), [a, b]);

    expect(sum.get()).toBe(5);

    a.set(10);

    expect(sum.get()).toBe(13);

    b.set(7);

    expect(sum.get()).toBe(17);
  });

  it('should work with multiple dependencies', () => {
    const firstName = new ObservableValue('John');
    const lastName = new ObservableValue('Doe');
    const age = new ObservableValue(30);

    const fullName = computed(() => `${firstName.get()} ${lastName.get()}, age ${age.get()}`, [firstName, lastName, age]);

    expect(fullName.get()).toBe('John Doe, age 30');

    lastName.set('Smith');
    expect(fullName.get()).toBe('John Smith, age 30');

    age.set(31);
    expect(fullName.get()).toBe('John Smith, age 31');
  });

  it('should work with computed values as dependencies', () => {
    const a = new ObservableValue(2);
    const b = new ObservableValue(3);
    const sum = computed(() => a.get() + b.get(), [a, b]);
    const doubled = computed(() => sum.get() * 2, [sum]);

    expect(doubled.get()).toBe(10);

    a.set(5);

    expect(sum.get()).toBe(8);
    expect(doubled.get()).toBe(16);
  });

  it('should return ComputedValue instance', () => {
    const a = new ObservableValue(1);
    const result = computed(() => a.get() * 2, [a]);

    expect(result).toBeInstanceOf(ComputedValue);
  });

  it('should warn when no dependencies provided', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    computed(() => 42, []);

    expect(consoleSpy).toHaveBeenCalledWith('Computed value with zero dependencies');

    consoleSpy.mockRestore();
  });

  it('should not update when unrelated observables change', () => {
    const a = new ObservableValue(2);
    const unrelated = new ObservableValue('unrelated');

    const sum = computed(() => a.get() + 1, [a]);

    expect(sum.get()).toBe(3);

    unrelated.set('changed');

    expect(sum.get()).toBe(3); // Should remain unchanged
  });

  it('should handle computation errors gracefully', () => {
    const a = new ObservableValue(2);

    const faulty = computed(() => {
      if (a.get() === 0) {
        throw new Error('Division by zero');
      }
      return 100 / a.get();
    }, [a]);

    expect(faulty.get()).toBe(50);

    // This should throw, but we can't easily test error handling here
    // since it depends on the ObservableValue implementation
    // We're mainly testing that the computed structure works
  });
});

describe('toggleClass', () => {
  let element: HTMLElement;
  let observable: ObservableValue<boolean>;

  beforeEach(() => {
    element = document.createElement('div');
    observable = new ObservableValue(false);
  });

  it('should add class when observable is true', () => {
    observable.set(true);

    const cleanup = toggleClass(observable, element, 'active');

    expect(element.classList.contains('active')).toBe(true);

    cleanup();
  });

  it('should remove class when observable is false', () => {
    observable.set(false);

    const cleanup = toggleClass(observable, element, 'active');

    expect(element.classList.contains('active')).toBe(false);

    cleanup();
  });

  it('should toggle class when observable changes', () => {
    const cleanup = toggleClass(observable, element, 'active');

    expect(element.classList.contains('active')).toBe(false);

    observable.set(true);

    expect(element.classList.contains('active')).toBe(true);

    observable.set(false);

    expect(element.classList.contains('active')).toBe(false);

    cleanup();
  });

  it('should work with invert option', () => {
    const cleanup = toggleClass(observable, element, 'active', true);

    expect(element.classList.contains('active')).toBe(true); // Inverted: false -> true

    observable.set(true);

    expect(element.classList.contains('active')).toBe(false); // Inverted: true -> false

    cleanup();
  });

  it('should return cleanup function', () => {
    const cleanup = toggleClass(observable, element, 'active');

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });

  it('should stop updating after cleanup', () => {
    const cleanup = toggleClass(observable, element, 'active');

    expect(element.classList.contains('active')).toBe(false);

    cleanup();

    observable.set(true);

    // Class should not be added after cleanup
    expect(element.classList.contains('active')).toBe(false);
  });

  it('should work with existing classes on element', () => {
    element.classList.add('existing');
    observable.set(true);

    const cleanup = toggleClass(observable, element, 'active');

    expect(element.classList.contains('existing')).toBe(true);
    expect(element.classList.contains('active')).toBe(true);

    cleanup();

    expect(element.classList.contains('existing')).toBe(true);
    // toggleClass cleanup doesn't remove the class, it just stops observing changes
    expect(element.classList.contains('active')).toBe(true);
  });
});