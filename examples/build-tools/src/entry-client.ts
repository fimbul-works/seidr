import { hydrate, isClient } from "@fimbul-works/seidr";
import { createIsomorphicApp } from "./isomorphic-app.js";

/**
 * Mounts or hydrates the isomorphic application on the client.
 *
 * @param {HTMLElement} [container] - Target container element
 * @returns {() => void} Teardown/unmount function
 */
export function mountClient(container?: HTMLElement): () => void {
  const target = container || document.getElementById("app") || document.body;
  const hydrationData = (window as any).__SEIDR_HYDRATION_DATA__;

  if (hydrationData) {
    return hydrate(() => createIsomorphicApp(), target, hydrationData);
  }

  const app = createIsomorphicApp();
  target.appendChild(app as unknown as Node);
  return () => {
    (app as unknown as HTMLElement)?.remove();
  };
}

// Auto-mount in browser environments if root exists
if (isClient()) {
  const root = document.getElementById("app");
  if (root) {
    mountClient(root);
  }
}
