import type { Seidr } from "../../seidr";
import { getCurrentComponent, type SeidrComponent } from "../component";

/**
 * Switches between different components based on an observable value.
 *
 * mountSwitch enables component routing or view switching by maintaining a mapping
 * from observable values to component factories. Only one component is active at
 * a time, with proper cleanup of the previous component before switching.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {string} T - The key type for switching
 *
 * @param {Seidr<T>} observable - Observable containing the current switch key
 * @param {Record<T, () => SeidrComponent>} componentMap - Object mapping keys to component factory functions
 * @param {HTMLElement} container - The DOM container for the active component
 * @returns {() => void} A cleanup function that removes the reactive binding and active component
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
 *
 * @example
 * Automatic cleanup when used within a parent component
 * ```typescript
 * function ViewManager() {
 *   return component((scope) => {
 *     const viewMode = new Seidr<'list' | 'grid'>('list');
 *
 *     // Automatically tracked - no need to store cleanup!
 *     mountSwitch(viewMode, {
 *       list: ListView,
 *       grid: GridView
 *     }, container);
 *
 *     return $('div', { className: 'view-manager' });
 *   });
 * }
 * ```
 */
export function mountSwitch<T extends string>(
  observable: Seidr<T>,
  componentMap: Record<T, () => SeidrComponent>,
  container: HTMLElement,
): () => void {
  let currentComponent: SeidrComponent | null = null;

  function update(key: T) {
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
  }

  // Initial render
  update(observable.value);

  // Track changes
  const unsubscribe = observable.observe(update);

  const cleanup = () => {
    unsubscribe();
    if (currentComponent) {
      currentComponent.element.remove();
      currentComponent.destroy();
      currentComponent = null;
    }
  };

  // Automatically track cleanup if called within a component's render function
  const parentComponent = getCurrentComponent();
  if (parentComponent) {
    parentComponent.scope.track(cleanup);
  }

  return cleanup;
}
