import { $a, $div, $footer, $nav, initRouter, Link, Router, Seidr, setState } from "../../src/core/index.js";
import { routes } from "./routes.js";
import { currentPostKey, postsKey } from "./state.js";
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
export const BlogApp = (props?: { posts?: BlogPost[]; currentPost?: BlogPost | null }) => {
  initRouter();

  const posts = new Seidr<BlogPost[]>([]);
  const currentPost = new Seidr<BlogPost | null>(null);

  if (props) {
    if (props.posts) posts.value = props.posts;
    if (props.currentPost) currentPost.value = props.currentPost;

    setState(postsKey, posts);
    setState(currentPostKey, currentPost);
  } else {
    setState(postsKey, posts);
    setState(currentPostKey, currentPost);
  }

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
