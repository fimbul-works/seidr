import type { Component } from "./component.js";
import type { SeidrElement } from "./element.js";
import type { CleanupFunction, ObservableValue } from "./value.js";

/**
 * Mount a component into a container element.
 *
 * @template E - The type of HTML element being mounted
 *
 * @param component - Component to mount
 * @param container - Container component to mount to
 * @return Returns a function to unmount the component
 */
export function mount<E extends SeidrElement>(component: Component<E>, container: HTMLElement): CleanupFunction {
  container.appendChild(component.element);

  return () => {
    component.element.destroy();
    component.destroy();
  };
}

/**
 * Conditionally renders a component based on an observable boolean.
 * Automatically mounts/unmounts as the condition changes.
 *
 * @template E - The type of HTML element being mounted
 *
 * @param condition - ObservableValue boolean
 * @param componentFactory - Component factory function
 * @param container - Container component to mount to
 * @return Returns an interface to clean up
 *
 * @example
 * const showDetails = new ObservableValue(false);
 * const conditional = mountConditional(
 *   showDetails,
 *   () => DetailsPanel(),
 *   container
 * );
 * // Later: conditional.destroy() to cleanup
 */
export function mountConditional<E extends SeidrElement>(
  condition: ObservableValue<boolean>,
  componentFactory: () => Component<E>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: Component<E> | null = null;

  const update = (shouldShow: boolean) => {
    if (shouldShow && !currentComponent) {
      currentComponent = componentFactory();
      container.appendChild(currentComponent.element);
    } else if (!shouldShow && currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };

  // Initial render
  update(condition.value);

  // Track changes
  const unsubscribe = condition.observe(update);

  return () => {
    unsubscribe();
    if (currentComponent) {
      currentComponent.element.destroy();
      currentComponent.destroy();
      currentComponent = null;
    }
  };
}

/**
 * Renders a list of components from an observable array.
 * Efficiently updates by comparing keys.
 *
 * @template T - List item type
 * @template K - List item key type
 * @template E - The type of HTML element being mounted
 *
 * @param observable - ObservableValue that contains an array
 * @param getKey - Get unique key from a list item
 * @param componentFactory - Component factory function
 * @param container - Container component to mount to
 * @return Returns an interface to clean up
 *
 * @example
 * const items = new ObservableValue([
 *   { id: 1, name: 'Item 1' },
 *   { id: 2, name: 'Item 2' }
 * ]);
 *
 * const list = mountList(
 *   items,
 *   (item) => item.id,
 *   (item) => ListItem(item),
 *   container
 * );
 */
export function mountList<T, K extends string | number, E extends SeidrElement>(
  observable: ObservableValue<T[]>,
  getKey: (item: T) => K,
  componentFactory: (item: T) => Component<E>,
  container: HTMLElement,
): CleanupFunction {
  const componentMap = new Map<K, Component<E>>();

  const update = (items: T[]) => {
    const newKeys = new Set(items.map(getKey));

    // Remove components that are no longer in the list
    for (const [key, component] of componentMap.entries()) {
      if (!newKeys.has(key)) {
        component.element.remove();
        component.destroy();
        componentMap.delete(key);
      }
    }

    // Add or reorder components
    items.forEach((item, index) => {
      const key = getKey(item);
      let component = componentMap.get(key);

      if (!component) {
        component = componentFactory(item);
        componentMap.set(key, component);
      }

      // Ensure correct position
      const currentChild = container.children[index];
      if (currentChild !== component.element) {
        if (currentChild) {
          container.insertBefore(component.element, currentChild);
        } else {
          container.appendChild(component.element);
        }
      }
    });
  };

  // Initial render
  update(observable.value);

  // Track changes
  const unsubscribe = observable.observe(update);

  return () => {
    unsubscribe();
    for (const component of componentMap.values()) {
      component.element.destroy();
      component.destroy();
    }
    componentMap.clear();
  };
}

/**
 * Switch between different components based on an observable value.
 *
 * @template K - Key to switch between
 * @template E - The type of HTML element being mounted
 *
 * @param observable - ObservableValue that stores the key
 * @param componentMap - A map of key to Component
 * @param container - Container component to mount to
 * @return Returns an interface to clean up
 *
 * @example
 * const view = new ObservableValue<'list' | 'grid'>('list');
 * const switcher = mountSwitch(
 *   view,
 *   {
 *     list: () => ListView(),
 *     grid: () => GridView(),
 *   },
 *   container
 * );
 */
export function mountSwitch<K extends string, E extends SeidrElement>(
  observable: ObservableValue<K>,
  componentMap: Record<K, () => Component<E>>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: Component<E> | null = null;

  const update = (key: K) => {
    if (currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
    }

    const factory = componentMap[key];
    if (factory) {
      currentComponent = factory();
      container.appendChild(currentComponent.element);
    } else {
      currentComponent = null;
      console.warn(`No component found for key: ${key}`);
    }
  };

  // Initial render
  update(observable.value);

  // Track changes
  const unsubscribe = observable.observe(update);

  return () => {
    unsubscribe();
    if (currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };
}
