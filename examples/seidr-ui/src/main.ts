import { createComponent, createRef, mount } from "@fimbul-works/seidr";
import { $button, $div, $h1, $header, $link, $main, $p } from "@fimbul-works/seidr/html";
import { useColorMode } from "@fimbul-works/seidr-ui";
import { examples } from "./showcases/index.js";

const App = createComponent(() => {
  const { mode, resolvedMode } = useColorMode({
    initialValue: "dark",
    attribute: "data-theme",
  });
  const linkRef = createRef<HTMLLinkElement>();

  const toggleTheme = () => {
    mode(resolvedMode() === "dark" ? "light" : "dark");
  };

  return $div({ className: "layout" }, [
    // Header
    $header({ className: "header" }, [
      $div({ className: "header-title-group" }, [
        $h1("Seidr UI"),
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

    // Component Showcase Grid
    $main(
      { className: "section-examples" },
      examples.map((d) => d.component()),
    ),
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
