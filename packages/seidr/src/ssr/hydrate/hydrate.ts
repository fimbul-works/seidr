import { isNullish, isStr } from "@fimbul-works/hvat";
import type { SeidrComponentFactoryOrFunction } from "../../component/types.js";
import { wrapComponent } from "../../component/wrap-component.js";
import { appendChild, mountConnectedComponents } from "../../dom/append-child.js";
import { type CleanupFunction, SeidrError } from "../../types.js";
import { getHydrationSerializer } from "../hydration-serializer.js";
import type { HydrationData } from "../types.js";
import { clearHydrationContext, initHydrationContext } from "./hydration-context.js";
import { clearHydrationData, initHydrationData, isHydrating } from "./storage.js";

/**
 * Hydrates a component with previously captured SSR hydration data.
 * Claims existing DOM nodes in container and binds reactive state.
 *
 * @param {SeidrComponentFactoryOrFunction} factory - Component to hydrate
 * @param {HTMLElement} container - The HTMLElement containing server-rendered markup
 * @param {HydrationData | string} hydrationData - The previously captured hydration data (object or serialized string)
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when called during an active hydration pass
 * @throws {SeidrError} if hydration payload is missing required fields
 * @throws {SeidrError} if passed a null parent in non-production mode
 */
export function hydrate(
  factory: SeidrComponentFactoryOrFunction,
  container: HTMLElement,
  hydrationData: HydrationData | string,
): CleanupFunction {
  if (isHydrating()) {
    throw new SeidrError("Hydration is already active");
  }

  if (process.env.NODE_ENV !== "production" && !container) {
    throw new SeidrError("Cannot mount to null parent");
  }

  const resolvedData: HydrationData = isStr(hydrationData)
    ? (getHydrationSerializer().parse(hydrationData) as HydrationData)
    : hydrationData;

  if (
    isNullish(resolvedData) ||
    isNullish(resolvedData.ctxID) ||
    isNullish(resolvedData.data) ||
    isNullish(resolvedData.components)
  ) {
    throw new SeidrError("Invalid hydration data");
  }

  // Initialize hydration data and context
  initHydrationData(resolvedData);

  try {
    const { rootStartMarker, rootEndMarker } = initHydrationContext(container);
    const rootComponent = wrapComponent(factory, "Root")();
    // Claiming phase is complete; clear HydrationContext before mount/onMounted creates fresh client DOM nodes
    clearHydrationContext();

    if (
      rootStartMarker &&
      rootEndMarker &&
      rootStartMarker.parentNode === container &&
      rootEndMarker.parentNode === container
    ) {
      // Sweep stale unclaimed SSR nodes before mount() so synchronous onMounted updates are preserved
      const ownedNodes = new Set<ChildNode>(rootComponent.nodes);
      let current = rootStartMarker.nextSibling;
      while (current && current !== rootEndMarker) {
        const next = current.nextSibling;
        if (!ownedNodes.has(current)) {
          current.remove();
        }
        current = next;
      }

      // Reconcile root component nodes in reverse order before rootEndMarker
      let currentAnchor: ChildNode = rootEndMarker;
      for (let i = rootComponent.nodes.length - 1; i >= 0; i--) {
        const node = rootComponent.nodes[i];
        if (node !== currentAnchor.previousSibling) {
          container.insertBefore(node, currentAnchor);
        }
        currentAnchor = node;
      }

      if (container.isConnected) {
        rootComponent.mount();
        rootComponent.nodes.forEach(mountConnectedComponents);
      }

      return () => {
        rootComponent.unmount();
        rootStartMarker.remove();
        rootEndMarker.remove();
      };
    }

    appendChild(container, rootComponent);
    return () => rootComponent.unmount();
  } finally {
    clearHydrationData();
    clearHydrationContext();
  }
}
