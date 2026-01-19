import { renderToString } from "../../src/index.node.js";
import { BlogApp } from "./app.js";
import type { PageContext } from "./server.js";

export async function render(path: string, { posts = [], currentPost = null }: PageContext) {
  return await renderToString(() => BlogApp({ posts, currentPost }), {
    path,
  });
}
