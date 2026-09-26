import { describe, expect, it } from "vitest";
import { createComponent } from "../component/create-component.js";
import { onMounted } from "../component/lifecycle/on-mounted.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";
import { List } from "../components/list.js";
import { $a } from "../elements/a.js";
import { $canvas } from "../elements/canvas.js";
import { $div } from "../elements/div.js";
import { $h1 } from "../elements/h1.js";
import { $nav } from "../elements/nav.js";
import { $p } from "../elements/p.js";
import { $section } from "../elements/section.js";
import { $span } from "../elements/span.js";
import { $ul } from "../elements/ul.js";
import { createValue, type Value } from "../observable/value.js";
import { Link } from "../router/components/link.js";
import { Router } from "../router/components/router.js";
import type { Route } from "../router/types.js";
import { hydrate } from "../ssr/hydrate/hydrate.js";
import { renderToString } from "../ssr/render-to-string.js";
import { enableClientMode, enableSSRMode } from "../test-setup/index.js";
import { inClient } from "../util/environment/in-client.js";

describe("Multi-section SSR and Hydration with Router", () => {
  type NavItem = { href: string; textContent: string };

  const Navigation = createComponent(() => {
    const links = createValue<NavItem[]>(
      [
        { href: "#hero", textContent: "Home" },
        { href: "#whatsnew", textContent: "The Forge" },
        { href: "#manifesto", textContent: "Manifesto" },
        { href: "#projects", textContent: "Projects" },
        { href: "#summon", textContent: "Summon" },
      ],
      { hydrate: false },
    );

    return $nav({ className: "home-navigation" }, [
      Link({ to: "/", className: "nav-brand" }, ["FIMBUL", $span({ className: "accent" }, "WORKS")]),
      $ul(
        { className: "nav-links" },
        List(
          links,
          ({ href }) => href,
          (link: Value<NavItem>) =>
            Link({
              tagName: "a",
              to: link.as((l) => l.href),
              textContent: link.as((l) => l.textContent),
            }),
        ),
      ),
    ]);
  }, "Navigation");

  let canvas: HTMLCanvasElement | null = null;

  const HeroCanvas = () => {
    const canvasRef = createValue<HTMLCanvasElement | null>(null, { hydrate: false });

    inClient(() => {
      onMounted(() => {
        // Canvas initialized
        canvas = canvasRef();
      });
      onUnmounted(() => {});
    });

    return $canvas({ id: "hero-canvas", ref: canvasRef });
  };

  const HeroSection = createComponent(() => {
    return $section({ id: "hero" }, [
      HeroCanvas(),
      $div({ className: "content" }, [
        $div({ className: "overline" }, "The Forge is Open"),
        $h1({ className: "title" }, ["FIMBUL", $span({ className: "accent" }, "WORKS")]),
        $p({ className: "subtitle" }, "Forging tools at the edge of the world"),
        $a({ href: "#whatsnew", className: "cta" }, [$span(null, "Enter the Forge")]),
      ]),
      $div({ className: "scroll-hint" }, [$div({ className: "scroll-bar" }), $span(null, "Scroll")]),
    ]);
  }, "HeroSection");

  const ContactSection = createComponent(() => {
    return $section({ id: "contact" }, [
      $div({ className: "content" }, [$h1(null, "Summon"), $div(null, "Lets get in touch.")]),
    ]);
  }, "Contact");

  const HomePage = () => {
    return [Navigation(), HeroSection(), ContactSection()];
  };

  const routes: Route[] = [{ path: "/", component: HomePage, exact: true }];

  const App = (url?: string) => {
    return Router(routes, { url });
  };

  it("SSR renders and cleanly hydrates without DOM mismatches", async () => {
    // 1. SSR
    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(() => App("/"));
    cleanupSSR();

    expect(html).toContain("home-navigation");
    expect(html).toContain("hero-canvas");
    expect(html).toContain("contact");

    // 2. Client Hydrate
    const cleanupClient = enableClientMode();
    const container = document.body;
    container.innerHTML = html;

    const unmount = hydrate(() => App("http://localhost:4242/"), container, hydrationData);

    // Wait for microtask completion
    await new Promise(resolve => setTimeout(resolve));

    expect(container.querySelector("#hero-canvas")).toBeTruthy();
    expect(container.querySelector(".home-navigation")).toBeTruthy();
    expect(container.querySelector("#contact")).toBeTruthy();
    expect(canvas).toBeTruthy();

    unmount();
    container.innerHTML = "";
    cleanupClient();
  });
});
