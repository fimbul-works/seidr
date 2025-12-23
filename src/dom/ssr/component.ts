import type { ServerHTMLElement } from "./server-element.js";

/**
 * Server-side component interface
 */
export interface ServerComponent<T> {
  element: ServerHTMLElement;
  hydrationData?: T;
  destroy(): void;
}

/**
 * Create a server-rendered component
 */
export function component<T>(factory: () => ServerHTMLElement, hydrationData?: T): ServerComponent<T> {
  const element = factory();
  return {
    element,
    destroy() {
      // TODO
    },
    hydrationData,
  };
}
