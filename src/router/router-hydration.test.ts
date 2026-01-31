import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component, useScope } from "../component";
import { $ } from "../element";
import { resetIdCounter } from "../render-context/render-context.node";
import { hydrate, resetHydratingFlag } from "../ssr/hydrate";
import { clearHydrationData } from "../ssr/hydration-context";
import { renderToString } from "../ssr/render-to-string";
import { browserContext, enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { createRoute } from "./create-route";
import { getCurrentPath, resetClientPathState } from "./get-current-path";
import { initRouter } from "./init-router";
import { Router } from "./router";

describe("Router Hydration Unmounting", () => {
  let cleanupClientMode: CleanupFunction;

  beforeEach(() => {
    cleanupClientMode = enableClientMode();
    resetClientPathState();
    resetIdCounter();
    clearHydrationData();
    resetHydratingFlag();
  });

  afterEach(() => {
    cleanupClientMode();
    resetClientPathState();
    resetIdCounter();
    clearHydrationData();
    resetHydratingFlag();
  });

  it("should unmount SSR fallback when navigating to a valid route", async () => {
    let homeUnmounted = false;
    let fallbackUnmounted = false;

    const Home = component(() => {
      const scope = useScope();
      scope.track(() => {
        homeUnmounted = true;
      });
      return $("div", { className: "home", textContent: "Home" });
    });

    const Fallback = component(() => {
      const scope = useScope();
      scope.track(() => {
        fallbackUnmounted = true;
      });
      return $("div", { className: "fallback", textContent: "404" });
    });

    const App = component(() =>
      Router({
        routes: [createRoute("/", Home)],
        fallback: Fallback,
      }),
    );

    // 1. SSR a 404 page
    process.env.SEIDR_TEST_SSR = "true";
    browserContext.idCounter = 0;
    const { html, hydrationData } = await renderToString(() => App(), { path: "/unknown" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/unknown");
    browserContext.idCounter = 0;
    hydrate(() => App(), container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".fallback")).toBeTruthy();
    expect(container.querySelector(".home")).toBeFalsy();

    // 4. Navigate to "/"
    getCurrentPath().value = "/";

    // Verify unmount
    expect(container.querySelector(".fallback")).toBeFalsy();
    expect(container.querySelector(".home")).toBeTruthy();
    expect(fallbackUnmounted).toBe(true);
    expect(homeUnmounted).toBe(false);

    document.body.removeChild(container);
  });

  it("should unmount SSR route when navigating to fallback", async () => {
    let homeUnmounted = false;
    let fallbackUnmounted = false;

    const Home = component(() => {
      const scope = useScope();
      scope.track(() => {
        homeUnmounted = true;
      });
      return $("div", { className: "home", textContent: "Home" });
    });

    const Fallback = component(() => {
      const scope = useScope();
      scope.track(() => {
        fallbackUnmounted = true;
      });
      return $("div", { className: "fallback", textContent: "404" });
    });

    const App = component(() =>
      Router({
        routes: [createRoute("/", Home)],
        fallback: Fallback,
      }),
    );

    // 1. SSR Home page
    process.env.SEIDR_TEST_SSR = "true";
    browserContext.idCounter = 0;
    const { html, hydrationData } = await renderToString(() => App(), { path: "/" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/");
    browserContext.idCounter = 0;
    hydrate(() => App(), container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".fallback")).toBeFalsy();

    // 4. Navigate to "/unknown"
    getCurrentPath().value = "/unknown";

    // Verify unmount
    expect(container.querySelector(".home")).toBe(null);
    expect(container.querySelector(".fallback")).toBeTruthy();
    expect(homeUnmounted).toBe(true);
    expect(fallbackUnmounted).toBe(false);

    document.body.removeChild(container);
  });
});
