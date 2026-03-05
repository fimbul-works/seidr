import { $a, $div, $footer, $nav, Link, Router } from "../../src/index.core.js";
import { routes } from "./routes.js";

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
export const BlogApp = () => {
  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [Router(routes, () => $div({ textContent: "404 Not Found" }))]),
    $footer({ textContent: `© ${new Date().getFullYear()} Seidr Blog Example` }),
  ]);
};
