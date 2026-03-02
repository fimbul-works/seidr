import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { component, useScope } from "../../component";
import { $ } from "../../element";
import { resetRequestIdCounter } from "../../render-context/render-context.node";
import { clearHydrationData, hydrate } from "../../ssr/hydrate";
import { renderToString } from "../../ssr/render-to-string";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { isServer } from "../../util/environment/server";
import { getCurrentPath, resetClientPathState } from "../get-current-path";
import { Router } from "./router";

describe("Router Hydration Unmounting", () => {
  if (isServer()) {
    it("should skip in SSR", () => expect(true).toBe(true));
    return;
  }

  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  let homeUnmounted = false;
  let fallbackUnmounted = false;

  const Home = component(() => {
    const scope = useScope();
    scope.onUnmount(() => {
      homeUnmounted = true;
    });
    return $("div", { className: "home", textContent: "Home" });
  }, "Home");

  const Fallback = component(() => {
    const scope = useScope();
    scope.onUnmount(() => {
      fallbackUnmounted = true;
    });
    return $("div", { className: "fallback", textContent: "404" });
  }, "Fallback");

  const App = component(() => Router([[/^\/$/, Home]], Fallback), "App");

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    resetClientPathState();
    resetRequestIdCounter();
    clearHydrationData();
  });

  beforeEach(() => {
    resetClientPathState();
    homeUnmounted = false;
    fallbackUnmounted = false;
  });

  afterEach(() => {
    unmount?.();
    document.body.innerHTML = "";
  });

  afterAll(() => {
    resetClientPathState();
    resetRequestIdCounter();
    clearHydrationData();
    cleanupClientMode();
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
    getCurrentPath().value = "/unknown";
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
    const { html, hydrationData } = await renderToString(App, { path: "/" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    getCurrentPath().value = "/";
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
