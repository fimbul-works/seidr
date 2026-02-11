import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { component, useScope } from "../component";
import { $ } from "../element";
import { resetRequestIdCounter } from "../render-context/render-context.node";
import { clearHydrationData, hydrate, renderToString } from "../ssr/internal";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { createRoute } from "./create-route";
import { getCurrentPath, resetClientPathState } from "./get-current-path";
import { initRouter } from "./init-router";
import { Router } from "./router";
import { beforeEach } from "vitest";

describe("Router Hydration Unmounting", () => {
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  let homeUnmounted = false;
  let fallbackUnmounted = false;

  const Home = component(() => {
    const scope = useScope();
    scope.track(() => {
      homeUnmounted = true;
    });
    return $("div", { className: "home", textContent: "Home" });
  }, 'Home');

  const Fallback = component(() => {
    const scope = useScope();
    scope.track(() => {
      fallbackUnmounted = true;
    });
    return $("div", { className: "fallback", textContent: "404" });
  }, 'Fallback');

  const App = component(() => Router([createRoute("/", Home)], Fallback), 'App');

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    resetClientPathState();
    resetRequestIdCounter();
    clearHydrationData();
  });

  beforeEach(() => {
    homeUnmounted = false;
    fallbackUnmounted = false;
  });

  afterEach(() => {
    unmount?.();
    document.body.innerHTML = "";
  });

  afterAll(() => {
    cleanupClientMode();
    resetClientPathState();
    resetRequestIdCounter();
    clearHydrationData();
  });

  it("should unmount SSR fallback when navigating to a valid route", async () => {
    // 1. SSR a 404 page
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(App, { path: "/unknown" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/unknown");
    unmount = hydrate(App, container, hydrationData);

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
  });

  it("should unmount SSR route when navigating to fallback", async () => {
    // 1. SSR Home page
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(() => App(), { path: "/" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    initRouter("/");
    unmount = hydrate(App, container, hydrationData);

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
  });
});
