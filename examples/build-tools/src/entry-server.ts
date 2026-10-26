import { renderToString } from "@fimbul-works/seidr/ssr";
import { createIsomorphicApp } from "./isomorphic-app.js";

/**
 * Server-side render entry point.
 * Renders the isomorphic Seidr application to static HTML and serializes the state hydration data.
 *
 * @param {number} [initialCount=0] - Initial counter value
 * @returns {Promise<{ html: string; hydrationData: any }>} Rendered markup and hydration payload
 */
export async function renderServerApp(initialCount = 0): Promise<{ html: string; hydrationData: any }> {
  return await renderToString(() => createIsomorphicApp(initialCount));
}
