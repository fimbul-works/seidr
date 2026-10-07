import {
  createComponent,
  createValue,
  hydrate,
  inClient,
  List,
  onMounted,
  onUnmounted,
  useRef,
  type Value,
} from "@fimbul-works/seidr";
import { $a, $canvas, $div, $h1, $nav, $p, $section, $span, $ul } from "@fimbul-works/seidr/html";
import { renderToString } from "@fimbul-works/seidr/ssr";
import { enableClientMode, enableSSRMode } from "@fimbul-works/seidr/testing";
import { describe, expect, it } from "vitest";
import type { Route } from "../types.js";
import { Link } from "./link.js";
import { Router } from "./router.js";

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
    const canvasRef = useRef<HTMLCanvasElement>();

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
    await new Promise((resolve) => setTimeout(resolve));

    expect(container.querySelector("#hero-canvas")).toBeTruthy();
    expect(container.querySelector(".home-navigation")).toBeTruthy();
    expect(container.querySelector("#contact")).toBeTruthy();
    expect(canvas).toBeTruthy();

    unmount();
    container.innerHTML = "";
    cleanupClient();
  });
});
