import { $a, $div, $footer, $nav, initRouter, Link, Router, setState } from "../../src/index.browser.js";
import { inServer } from "../../src/ssr/env.js";
import { routes } from "./routes.js";
import type { PageContext } from "./server.js";

// Components
const Header = () =>
  $nav({ className: "navbar" }, [
    Link({ to: "/", className: "brand", textContent: "Seidr Blog" }),
    $div({ className: "links" }, [
      Link({ to: "/", textContent: "Home" }),
      $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank", textContent: "GitHub" }),
    ]),
  ]);

// Main App
export const BlogApp = ({ posts = [], currentPost = undefined }: PageContext = {}) => {
  initRouter();

  // Initialize state from props on the server
  inServer(() => {
    if (posts.length) {
      setState("posts", posts);
    }

    if (currentPost) {
      setState("currentPost", currentPost);
    }
  });

  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [
      Router({
        routes,
        fallback: () => $div({ textContent: "404 Not Found" }),
      }),
    ]),
    $footer({ textContent: `© ${new Date().getFullYear()} Seidr Blog Example` }),
  ]);
};
