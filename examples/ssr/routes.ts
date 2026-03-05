import type { RouteDefinition } from "../../src/index.browser.js";
import { HomePage, PostPage } from "./pages.js";

export const routes: RouteDefinition[] = [
  ["/", HomePage],
  ["/post/:slug", PostPage],
];
