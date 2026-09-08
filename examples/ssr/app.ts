import { createComponent, type Route, Router } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { Footer, Header } from "./components/index.js";
import { HomePage, NotFoundPage, PostPage } from "./pages/index.js";

// Route definitions
export const routes: Route[] = [
  { path: "/", component: HomePage, exact: true },
  { path: "/post/:slug", component: PostPage },
  { path: "*", component: NotFoundPage },
];

// Main App
export const BlogApp = createComponent((url?: string) => {
  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [Router(routes, { url })]),
    Footer(),
  ]);
}, "BlogApp");
