import { $a, $div, $footer, $nav, component } from "../../src/index.core.js";
import { Link, Router } from "../../src/router/index.js";
import { routes } from "./routes.js";

// Components
const Header = component(
  () =>
    $nav({ className: "navbar" }, [
      Link({ to: "/", className: "brand" }, "Seidr Blog"),
      $div({ className: "links" }, [
        Link({ to: "/" }, "Home"),
        $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank" }, "GitHub"),
      ]),
    ]),
  "Header",
);

// Main App
export const BlogApp = component(() => {
  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [Router(routes, () => $div({}, "404 Not Found"))]),
    $footer({}, `© ${new Date().getFullYear()} Seidr Blog Example`),
  ]);
}, "BlogApp");
