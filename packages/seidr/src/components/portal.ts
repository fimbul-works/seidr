import { getAppState } from "../app-state/get-app-state.js";
import { getComponentScope } from "../component/component-scope.js";
import { createComponent } from "../component/create-component.js";
import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../component/types.js";
import { wrapComponent } from "../component/wrap-component.js";
import { DATA_KEY_HYDRATION_CTX } from "../constants.js";
import { appendChild } from "../dom/append-child.js";
import { onMounted } from "../hooks/on-mounted.js";
import { isHydrating } from "../ssr/hydrate/storage.js";
import type { HydrationContext } from "../ssr/hydrate/types.js";
import { getSSRScope } from "../ssr/ssr-scope.js";
import { isServer } from "../util/environment/is-server.js";

/**
 * Renders a component or element factory into a target DOM element outside the parent DOM hierarchy.
 *
 * @param {HTMLElement} target - The target DOM element to portal into
 * @param {SeidrComponentFactoryOrFunction} factory - Function that creates the portaled content
 * @param {string} [name="Portal"] - Optional name for debugging
 * @returns {SeidrComponent} The Portal component instance
 */
export const Portal = (
  target: HTMLElement,
  factory: SeidrComponentFactoryOrFunction,
  name: string = "Portal",
): SeidrComponent =>
  createComponent(() => {
    const portal = getComponentScope()!;
    const appState = getAppState();
    const savedHydrationCtx =
      !process.env.SEIDR_DISABLE_SSR && isHydrating()
        ? appState.getData<HydrationContext>(DATA_KEY_HYDRATION_CTX)
        : undefined;

    if (savedHydrationCtx) {
      appState.deleteData(DATA_KEY_HYDRATION_CTX);
    }

    let content: SeidrComponent;
    try {
      content = wrapComponent(factory, `${name}Content`)();
    } finally {
      if (savedHydrationCtx) {
        appState.setData(DATA_KEY_HYDRATION_CTX, savedHydrationCtx);
      }
    }

    if (isServer()) {
      portal.untrackChild?.(content);
      const ssrScope = getSSRScope();
      if (ssrScope) {
        const unregisterTree = (comp: SeidrComponent) => {
          ssrScope.unregisterComponent(comp);
          comp.children.forEach(unregisterTree);
        };
        unregisterTree(content);
      }
    }

    onMounted(() => {
      if (savedHydrationCtx) {
        appState.deleteData(DATA_KEY_HYDRATION_CTX);
      }
      try {
        appendChild(target, content);
      } finally {
        if (savedHydrationCtx) {
          appState.setData(DATA_KEY_HYDRATION_CTX, savedHydrationCtx);
        }
      }
    });

    return null;
  }, name)();
