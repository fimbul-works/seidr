import type { Seidr } from "../../seidr";
import type { CleanupFunction } from "../../types";
import type { SeidrComponent } from "../component";

/**
 * Switches between different components based on an observable value.
 *
 * mountSwitch enables component routing or view switching by maintaining a mapping
 * from observable values to component factories. Only one component is active at
 * a time, with proper cleanup of the previous component before switching.
 *
 * @template T - The key type for switching (typically string literals)
 * @template C - The type of SeidrElement for all components
 *
 * @param {Seidr<T>} observable - Observable containing the current switch key
 * @param {Record<T, () => C>} componentMap - Object mapping keys to component factory functions
 * @param {HTMLElement} container - The DOM container for the active component
 * @returns {CleanupFunction} A cleanup function that removes the reactive binding and active component
 *
 * @example
 * View mode switching
 * ```typescript
 * import { component, mountSwitch, Seidr } from '@fimbul-works/seidr';
 *
 * type ViewMode = 'list' | 'grid' | 'table';
 * const viewMode = new Seidr<ViewMode>('list');
 *
 * const ListView = () => component(() =>
 *   $('div', { textContent: '📋 List View', className: 'view-list' })
 * );
 *
 * const GridView = () => component(() =>
 *   $('div', { textContent: '📊 Grid View', className: 'view-grid' })
 * );
 *
 * const TableView = () => component(() =>
 *   $('div', { textContent: '📈 Table View', className: 'view-table' })
 * );
 *
 * // Control buttons
 * const controls = $('div', { className: 'view-controls' }, [
 *   $('button', {
 *     textContent: 'List',
 *     onclick: () => viewMode.value = 'list'
 *   }),
 *   $('button', {
 *     textContent: 'Grid',
 *     onclick: () => viewMode.value = 'grid'
 *   }),
 *   $('button', {
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
export function mountSwitch<T extends string, C extends SeidrComponent<any, any>>(
  observable: Seidr<T>,
  componentMap: Record<T, () => C>,
  container: HTMLElement,
): CleanupFunction {
  let currentComponent: C | null = null;

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
