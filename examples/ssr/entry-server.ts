import { renderToString } from "../../src/index.ssr.js";
import { BlogApp } from "./app.js";

export async function render(path: string) {
  return await renderToString(BlogApp, {
    path,
  });
}
