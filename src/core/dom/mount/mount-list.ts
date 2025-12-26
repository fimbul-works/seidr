import type { Seidr } from "../../seidr";
import type { CleanupFunction } from "../../types";
import type { SeidrComponent } from "../component";

/**
 * Renders an efficient list of components from an observable array.
 *
 * mountList provides optimized list rendering with key-based diffing, ensuring
 * minimal DOM operations when the list changes. Components are reused when
 * possible, and only the necessary additions, removals, and reordering occur.
 *
 * @template T - The type of list items
 * @template I - The type of unique item keys (string or number)
 * @template C - The type of SeidrElement for list items
 *
 * @param {Seidr<T[]>} observable - Array observable containing the list data
 * @param {(item: T) => I} getKey - Function to extract unique keys from list items
 * @param {(item: T) => C} componentFactory - Function that creates components for individual items
 * @param {HTMLElement} container - The DOM container for the list
 * @returns {CleanupFunction} A cleanup function that removes all components and reactive bindings
 *
 * @example
 * Todo list rendering
 * ```typescript
 * import { $, component, mountList, Seidr } from '@fimbul-works/seidr';
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
 *     return $('div', { className: 'todo-item' }, [
 *       $('span', {
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
export function mountList<T, I extends string | number, C extends SeidrComponent<any, any>>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  componentFactory: (item: T) => C,
  container: HTMLElement,
): CleanupFunction {
  const componentMap = new Map<I, C>();

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
      component.element.remove();
      component.destroy();
    }
    componentMap.clear();
  };
}
