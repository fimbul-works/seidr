import type { Seidr } from "../../seidr";
import { isSeidrComponentFactory } from "../../util/is";
import { component, type SeidrComponent } from "../component";
import { $comment, type SeidrNode } from "../element";

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
 * @param {Map<T, (val: T) => SeidrNode> | Record<string, (val: T) => SeidrNode>} factories - Mapping from keys to component factory functions
 * @param {HTMLElement} container - The DOM container for the active component
 * @returns {() => void} A cleanup function that removes the reactive binding and active component
 *
 * @example
 * View mode switching
 * ```typescript
 * import { mountSwitch, Seidr, $ } from '@fimbul-works/seidr';
 *
 * type ViewMode = 'list' | 'grid' | 'table';
 * const viewMode = new Seidr<ViewMode>('list');
 *
 * const ListView = () =>
 *   $('div', { textContent: '📋 List View', className: 'view-list' });
 *
 * const GridView = () =>
 *   $('div', { textContent: '📊 Grid View', className: 'view-grid' });
 *
 * const TableView = () =>
 *   $('div', { textContent: '📈 Table View', className: 'view-table' });
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
 * const ViewManager = () => {
 *   const viewMode = new Seidr<'list' | 'grid'>('list');
 *
 *   // Automatically tracked - no need to store cleanup!
 *   mountSwitch(viewMode, {
 *     list: ListView,
 *     grid: GridView
 *   }, container);
 *
 *   return $('div', { className: 'view-manager' });
 * };
 * ```
 */
export function mountSwitch<T extends string, C extends SeidrNode>(
  observable: Seidr<T>,
  factories: Map<T, (val: T) => C> | Record<string, (val: T) => C>,
  container: HTMLElement,
  defaultCase?: (val: T) => C,
): () => void {
  const marker = $comment("mount-switch-marker");
  container.appendChild(marker);

  let currentComponent: SeidrComponent | null = null;

  const update = (value: T) => {
    const caseFactory = factories instanceof Map ? factories.get(value) : (factories as any)[String(value)];

    const factory = caseFactory || defaultCase;

    if (currentComponent) {
      currentComponent.destroy();
      currentComponent = null;
    }

    if (factory) {
      currentComponent = (
        isSeidrComponentFactory(factory) ? factory(value) : component<T>(factory as any)(value)
      ) as SeidrComponent;
      container.insertBefore(currentComponent.element, marker);
    }
  };

  // Initial render
  update(observable.value);

  // Reactive updates
  const cleanup = observable.observe((val) => update(val));

  // Return combined cleanup
  return () => {
    cleanup();
    if (currentComponent) {
      currentComponent.destroy();
    }
    if (container.contains(marker)) {
      container.removeChild(marker);
    }
  };
}
