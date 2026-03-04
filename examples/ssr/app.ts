import { $a, $div, $footer, $nav, inServer, Link, Router, Seidr } from "../../src/index.browser.js";
import { routes } from "./routes.js";
import type { PageContext } from "./server.js";
import type { BlogPost } from "./types.js";

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
export const BlogApp = ({ initialPosts = [], initialCurrentPost = undefined }: PageContext = {}) => {
  const posts = new Seidr<BlogPost[]>(initialPosts);
  const currentPost = new Seidr<BlogPost | undefined>(initialCurrentPost);

  // Initialize state from props on the server
  inServer(() => {
    if (initialPosts.length) {
      posts.value = initialPosts;
    }

    if (initialCurrentPost) {
      currentPost.value = initialCurrentPost;
    }
  });

  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [Router(routes, () => $div({ textContent: "404 Not Found" }))]),
    $footer({ textContent: `© ${new Date().getFullYear()} Seidr Blog Example` }),
  ]);
};
