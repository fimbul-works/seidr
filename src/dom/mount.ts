import type { CleanupFunction, Seidr } from "../seidr.js";
import type { Component } from "./component.js";
import type { SeidrElement } from "./element.js";

/**
 * Mounts a component into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * @template E - The type of SeidrElement being mounted
 *
 * @param component - The component to mount
 * @param container - The DOM container element to mount the component into
 *
 * @returns A cleanup function that unmounts the component when called
 *
 * @example
 * Basic component mounting
 * ```typescript
 * import { mount, component } from '@fimbul-works/seidr';
 *
 * const counterComponent = createCounter();
 * const unmount = mount(counterComponent, document.body);
 *
 * // Later cleanup
 * unmount(); // Removes component and cleans up all resources
 * ```
 */
export function mount<K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
  component: Component<K, E>,
  container: HTMLElement,
): CleanupFunction {
  container.appendChild(component.element);

  return () => {
    component.element.destroy();
    component.destroy();
  };
}

/**
 * Conditionally renders a component based on a boolean observable state.
 *
 * This function provides lazy component creation - the component factory function
 * is only called when the condition becomes true. When the condition becomes false,
 * the component is properly destroyed and removed from the DOM.
 *
 * @template E - The type of SeidrElement being conditionally mounted
 *
 * @param condition - Boolean observable that controls component visibility
 * @param componentFactory - Function that creates the component when needed
 * @param container - The DOM container element
 *
 * @returns A cleanup function that removes the reactive binding and any active component
 *
 * @example
 * Conditional panel display
 * ```typescript
 * import { mountConditional, Seidr, component } from '@fimbul-works/seidr';
 *
 * const isVisible = new Seidr(false);
 *
 * function DetailsPanel() {
 *   return component((scope) => {
 *     return createElement('div', { className: 'details-panel' }, [
 *       createElement('h2', { textContent: 'Details' }),
 *       createElement('p', { textContent: 'Additional information...' })
 *     ]);
 *   });
 * }
 *
 * const cleanup = mountConditional(
 *   isVisible,
 *   () => DetailsPanel(), // Only created when true
 *   document.body
 * );
 *
 * // Show panel
 * isVisible.value = true; // Creates and mounts DetailsPanel
 *
 * // Hide panel
 * isVisible.value = false; // Destroys and removes DetailsPanel
 * ```
 */
export function mountConditional<K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
  condition: Seidr<boolean>,
  componentFactory: () => Component<K, E>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: Component<K, E> | null = null;

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
 * Renders an efficient list of components from an observable array.
 *
 * mountList provides optimized list rendering with key-based diffing, ensuring
 * minimal DOM operations when the list changes. Components are reused when
 * possible, and only the necessary additions, removals, and reordering occur.
 *
 * @template T - The type of list items
 * @template I - The type of unique item keys (string or number)
 * @template E - The type of SeidrElement for list items
 *
 * @param observable - Array observable containing the list data
 * @param getKey - Function to extract unique keys from list items
 * @param componentFactory - Function that creates components for individual items
 * @param container - The DOM container for the list
 *
 * @returns A cleanup function that removes all components and reactive bindings
 *
 * @example
 * Todo list rendering
 * ```typescript
 * import { mountList, Seidr, component, createElement } from '@fimbul-works/seidr';
 *
 * type Todo = { id: number; text: string; completed: boolean };
 *
 * const todos = new Seidr<Todo[]>([
 *   { id: 1, text: 'Learn Seidr', completed: false },
 *   { id: 2, text: 'Build apps', completed: false }
 * ]);
 *
 * function TodoItem({ todo }: { todo: Todo }) {
 *   return component((scope) => {
 *     const isCompleted = new Seidr(todo.completed);
 *
 *     return createElement('div', { className: 'todo-item' }, [
 *       createElement('span', {
 *         textContent: todo.text,
 *         style: isCompleted.as(completed =>
 *           completed ? 'text-decoration: line-through' : ''
 *         )
 *       })
 *     ]);
 *   });
 * }
 *
 * const cleanup = mountList(
 *   todos,
 *   (todo) => todo.id, // Unique key extraction
 *   (todo) => TodoItem({ todo }), // Component factory
 *   document.getElementById('todo-list')
 * );
 *
 * // Add new item - only one component is created
 * todos.value = [...todos.value, { id: 3, text: 'Master Seidr', completed: true }];
 *
 * // Remove item - only one component is destroyed
 * todos.value = todos.value.filter(todo => todo.id !== 1);
 * ```
 */
export function mountList<
  T,
  I extends string | number,
  K extends keyof HTMLElementTagNameMap,
  E extends SeidrElement<K>,
>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  componentFactory: (item: T) => Component<K, E>,
  container: HTMLElement,
): CleanupFunction {
  const componentMap = new Map<I, Component<K, E>>();

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
 * Switches between different components based on an observable value.
 *
 * mountSwitch enables component routing or view switching by maintaining a mapping
 * from observable values to component factories. Only one component is active at
 * a time, with proper cleanup of the previous component before switching.
 *
 * @template T - The key type for switching (typically string literals)
 * @template E - The type of SeidrElement for all components
 *
 * @param observable - Observable containing the current switch key
 * @param componentMap - Object mapping keys to component factory functions
 * @param container - The DOM container for the active component
 *
 * @returns A cleanup function that removes the reactive binding and active component
 *
 * @example
 * View mode switching
 * ```typescript
 * import { mountSwitch, Seidr, component, createElement } from '@fimbul-works/seidr';
 *
 * type ViewMode = 'list' | 'grid' | 'table';
 * const viewMode = new Seidr<ViewMode>('list');
 *
 * const ListView = () => component(() =>
 *   createElement('div', { textContent: '📋 List View', className: 'view-list' })
 * );
 *
 * const GridView = () => component(() =>
 *   createElement('div', { textContent: '📊 Grid View', className: 'view-grid' })
 * );
 *
 * const TableView = () => component(() =>
 *   createElement('div', { textContent: '📈 Table View', className: 'view-table' })
 * );
 *
 * // Control buttons
 * const controls = createElement('div', { className: 'view-controls' }, [
 *   createElement('button', {
 *     textContent: 'List',
 *     onclick: () => viewMode.value = 'list'
 *   }),
 *   createElement('button', {
 *     textContent: 'Grid',
 *     onclick: () => viewMode.value = 'grid'
 *   }),
 *   createElement('button', {
 *     textContent: 'Table',
 *     onclick: () => viewMode.value = 'table'
 *   })
 * ]);
 *
 * document.body.appendChild(controls);
 *
 * // Switch components automatically
 * const cleanup = mountSwitch(
 *   viewMode,
 *   {
 *     list: ListView,
 *     grid: GridView,
 *     table: TableView
 *   },
 *   document.body
 * );
 *
 * // Switch views
 * viewMode.value = 'grid'; // Automatically switches to GridView
 * viewMode.value = 'table'; // Automatically switches to TableView
 * ```
 */
export function mountSwitch<T extends string, K extends keyof HTMLElementTagNameMap, E extends SeidrElement<K>>(
  observable: Seidr<T>,
  componentMap: Record<T, () => Component<K, E>>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: Component<K, E> | null = null;

  const update = (key: T) => {
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
