import type { RouteDefinition } from "../../src/router/index.js";
import { HomePage, PostPage } from "./pages.js";

export const routes: RouteDefinition[] = [
  ["/", HomePage],
  ["/post/:slug", PostPage],
];
