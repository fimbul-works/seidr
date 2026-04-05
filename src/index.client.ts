import type { ComponentReturnValue } from "./component/types";
import { Seidr } from "./seidr/seidr";
import { registerSeidrForSSR } from "./ssr/register-seidr";
import type { RenderToStringOptions } from "./ssr/render-to-string";
import type { SSRRenderResult } from "./ssr/types";
import { SeidrError } from "./types";

export * from "./index.core";
export * from "./ssr/hydrate/hydrate";

/**
 * Mock implementation of renderToString for the client bundle.
 * This function will throw an error if called, as renderToString is not available in the client bundle.
 *
 * @param {() => C} _factory
 * @param {RenderToStringOptions} _options
 */
export async function renderToString<C extends ComponentReturnValue>(
  _factory: () => C,
  _options: RenderToStringOptions = {},
): Promise<SSRRenderResult> {
  throw new SeidrError(
    "renderToString is not available in the client bundle. Please use the server bundle for SSR rendering.",
  );
}

Seidr.register = registerSeidrForSSR;
