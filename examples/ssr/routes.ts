import { createRoute } from "../../src/core/index.js";
import { HomePage, PostPage } from "./pages.js";

export const routes = [createRoute("/", HomePage), createRoute("/post/:slug", PostPage)];
