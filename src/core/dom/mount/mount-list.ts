/**
 * Renders an efficient list of components from an observable array.
 *
 * mountList provides optimized list rendering with key-based diffing, ensuring
 * minimal DOM operations when the list changes. Components are reused when
 * possible, and only the necessary additions, removals, and reordering occur.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {any} T - The type of list items
 * @template {string | number} I - The type of unique item keys (string or number)
 * @template {SeidrComponent} C - The type of SeidrComponent for list items
 *
 * @param {Seidr<T[]>} observable - Array observable containing the list data
 * @param {(item: T) => I} getKey - Function to extract unique keys from list items
 * @param {(item: T) => C} componentFactory - Function that creates components for individual items
 * @param {HTMLElement} container - The DOM container for the list
 * @returns {(() => void)} A cleanup function that removes all components and reactive bindings
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
 * const TodoItem = ({ todo }: { todo: Todo }) => component(() => {
 *   const isCompleted = new Seidr(todo.completed);
 *
 *   return $('div', { className: 'todo-item' }, [
 *     $('span', {
 *       textContent: todo.text,
 *       style: isCompleted.as(completed =>
 *         completed ? 'text-decoration: line-through' : ''
 *       )
 *     })
 *   ]);
 * });
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
 *
 * @example
 * Automatic cleanup when used within a parent component
 * ```typescript
 * const TodoList = component(() => {
 *   const todos = new Seidr<Todo[]>([]);
 *
 *   // Automatically tracked - no need to store cleanup!
 *   mountList(todos, (t) => t.id, (t) => TodoItem({ todo: t }), container);
 *
 *   return $('div', { className: 'todo-list' });
 * });
 * ```
 */
import type { Seidr } from "../../seidr";
import type { SeidrComponent } from "../component";
import { $comment } from "../element";

/**
 * Renders an efficient list of components from an observable array.
 * Legacy utility that internally implements list rendering.
 */
export function mountList<T, I extends string | number, C extends SeidrComponent>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  componentFactory: (item: T) => C,
  container: HTMLElement,
): () => void {
  const marker = $comment("mount-list-marker");
  container.appendChild(marker);
  const componentMap = new Map<I, C>();

  const update = (items: T[]) => {
    const newKeys = new Set(items.map(getKey));

    // Remove components no longer in list
    for (const [key, comp] of componentMap.entries()) {
      if (!newKeys.has(key)) {
        comp.destroy();
        componentMap.delete(key);
      }
    }

    // Add or reorder components by iterating backwards from marker
    let currentAnchor: Node = marker;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const key = getKey(item);
      let comp = componentMap.get(key);

      if (!comp) {
        comp = componentFactory(item);
        componentMap.set(key, comp);
      }

      // Move to correct position if needed
      if (comp.element.nextSibling !== currentAnchor) {
        container.insertBefore(comp.element, currentAnchor);
      }

      currentAnchor = comp.element;
    }
  };

  // Initial render
  update(observable.value);

  // Reactive updates
  const cleanup = observable.observe((items) => update(items));

  // Return combined cleanup
  return () => {
    cleanup();
    for (const comp of componentMap.values()) {
      comp.destroy();
    }
    componentMap.clear();
    if (container.contains(marker)) {
      container.removeChild(marker);
    }
  };
}
