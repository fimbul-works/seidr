import { type SeidrComponent, wrapComponent } from "../component";
import { $comment, type SeidrElement, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";

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
 * @param {HTMLElement | SeidrElement} container - The DOM container for the active component
 * @returns {CleanupFunction} A cleanup function that removes the reactive binding and active component
 */
export function mountSwitch<T extends string = string, C extends SeidrNode = SeidrNode>(
  observable: Seidr<T>,
  factories: Map<T, (val: T) => C> | Record<string, (val: T) => C>,
  container: HTMLElement | SeidrElement,
  defaultCase?: (val: T) => C,
): CleanupFunction {
  // Bind the container to the render context if not already bound
  const ctx = getRenderContext();
  if (!ctx.rootNode) {
    ctx.rootNode = container;
  }

  const marker = $comment(`seidr-mount-switch:${ctx.ctxID}-:${ctx.idCounter++}`);
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
      currentComponent = wrapComponent<typeof value>(factory)(value);
      container.insertBefore(currentComponent.element, marker);

      // Trigger onAttached when component is added to DOM
      if (currentComponent.scope.onAttached) {
        currentComponent.scope.onAttached(container);
      }
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
