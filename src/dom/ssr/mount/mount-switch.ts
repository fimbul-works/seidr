import type { Seidr } from "../../../seidr.js";
import type { CleanupFunction } from "../../../types.js";
import type { ServerComponent } from "../component.js";
import type { ServerHTMLElement } from "../server-element.js";

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
export function mountSwitch<T extends string, C>(
  observable: Seidr<T>,
  componentMap: Record<T, () => ServerComponent<C>>,
  container: ServerHTMLElement,
): CleanupFunction {
  let currentComponent: ServerComponent<C> | null = null;

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
