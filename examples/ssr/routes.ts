import { createRoute } from "../../src/index.browser.js";
import { HomePage, PostPage } from "./pages.js";

export const routes = [createRoute("/", HomePage), createRoute("/post/:slug", PostPage)];
