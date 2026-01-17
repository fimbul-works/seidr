import { renderToString } from "../../src/index.node.js";
import { BlogApp } from "./app.js";
import type { BlogPost } from "./types.js";

export async function render(path: string) {
  return await renderToString(() => BlogApp(), {
    path,
  });
}
