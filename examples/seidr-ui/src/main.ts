import { createComponent, createRef, mount } from "@fimbul-works/seidr";
import { $button, $div, $h1, $header, $img, $link, $main, $p } from "@fimbul-works/seidr/html";
import { type Route, Router } from "@fimbul-works/seidr-router";
import { Link, useColorMode } from "@fimbul-works/seidr-ui";
import { componentShowcases } from "./component-showcases/index.js";
import { Navigation } from "./components/navigation.js";

const App = createComponent(() => {
  const { mode, resolvedMode } = useColorMode({
    initialValue: "dark",
    attribute: "data-theme",
  });
  const linkRef = createRef<HTMLLinkElement>();

  const toggleTheme = () => {
    mode(resolvedMode() === "dark" ? "light" : "dark");
  };

  const routes: Route[] = componentShowcases.map((showcase) => ({
    path: `/components/${showcase.id}`,
    component: showcase.component,
  }));

  routes.push({
    path: "/",
    exact: true,
    component: () => "Please select a showcase from the navigation",
  });

  routes.push({
    path: "*",
    component: () => "Not found",
  });

  return $div({ className: "layout" }, [
    // Header
    $header({ className: "header" }, [
      $div({ className: "header-title-group" }, [
        Link({ href: "/" }, [$h1([$img({ src: "/seidr-logo.svg", className: "seidr-logo", alt: "Seidr" }), "UI"])]),
        $p({ className: "header-subtitle" }, "Headless, accessible UI primitives for Seidr applications"),
      ]),
      $div({ className: "header-actions" }, [
        $button(
          {
            className: "btn-theme",
            onclick: toggleTheme,
          },
          resolvedMode.as((m) => (m === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode")),
        ),
      ]),
    ]),

    $div({ className: "content" }, [Navigation(), $main({ className: "section-content" }, Router(routes))]),

    $link({
      ref: linkRef,
      href: resolvedMode.as(
        (mode) =>
          `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.12.0/styles/github${mode === "dark" ? "-dark" : ""}.min.css`,
      ),
      rel: "stylesheet",
    }),
  ]);
}, "SeidrUIShowcase");

const rootEl = document.getElementById("app");
if (rootEl) {
  mount(App, rootEl);
}
