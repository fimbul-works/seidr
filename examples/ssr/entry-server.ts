import { DATA_KEY_ROUTER } from "@fimbul-works/seidr";
import { renderToString, type SSRRenderResult } from "@fimbul-works/seidr/ssr";
import { BlogApp } from "./app.js";

export function render(url: string): Promise<SSRRenderResult> {
  return renderToString(BlogApp, { [DATA_KEY_ROUTER]: url });
}
