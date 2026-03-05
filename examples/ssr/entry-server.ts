import { renderToString } from "../../src/index.node.js";
import { BlogApp } from "./app.js";

export async function render(path: string) {
  return await renderToString(BlogApp, {
    path,
  });
}
