import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../../app-state/app-state";
import { resetRequestIdCounter } from "../../app-state/app-state.server";
import { component, onUnmount } from "../../component";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { noHydrate } from "../../seidr/constants";
import { clearHydrationData, hydrate } from "../../ssr/hydrate";
import { renderToString } from "../../ssr/render-to-string";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { PATH_DATA_KEY, PATH_SEIDR_ID } from "../constants";
import { clearPathCache } from "../get-current-path";
import { useNavigate } from "../hooks/use-navigate";
import { Router } from "./router";

describe("Router Hydration", () => {
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction;

  let homeUnmounted = false;
  let fallbackUnmounted = false;

  const Home = component(() => {
    onUnmount(() => {
      homeUnmounted = true;
    });
    return $("div", { className: "home", textContent: "Home" });
  }, "Home");

  const Fallback = component(() => {
    onUnmount(() => {
      fallbackUnmounted = true;
    });
    return $("div", { className: "fallback", textContent: "404" });
  }, "Fallback");

  const App = component(() => Router([["/", Home]], Fallback), "App");

  beforeAll(() => {
    cleanupClientMode = enableClientMode();
    clearPathCache();
    resetRequestIdCounter();
    clearHydrationData();
  });

  beforeEach(() => {
    clearPathCache();
    homeUnmounted = false;
    fallbackUnmounted = false;
  });

  afterEach(() => {
    clearPathCache();
    unmount?.();
    document.body.innerHTML = "";
  });

  afterAll(() => {
    resetRequestIdCounter();
    clearHydrationData();
    cleanupClientMode();
  });

  it("should mount default route when navigating to home", async () => {
    // 1. SSR a 404 page
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(App, { path: "/" });
    delete process.env.SEIDR_TEST_SSR;

    // 2. Setup browser DOM
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".fallback")).toBeFalsy();
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
    getAppState().setData(PATH_DATA_KEY, new Seidr("/unknown", { ...noHydrate, id: PATH_SEIDR_ID }));
    window.history.pushState({}, "", "/unknown");

    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".fallback")).toBeTruthy();
    expect(container.querySelector(".home")).toBeFalsy();

    // 4. Navigate to "/"
    useNavigate()("/");

    await new Promise((r) => setTimeout(r, 10));
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
    getAppState().setData(PATH_DATA_KEY, new Seidr("/", { ...noHydrate, id: PATH_SEIDR_ID }));
    window.history.pushState({}, "", "/");
    unmount = hydrate(App, container, hydrationData);

    // Verify initial state
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".fallback")).toBeFalsy();

    // 4. Navigate to "/unknown"
    useNavigate()("/unknown");

    await new Promise((r) => setTimeout(r, 10));
    // Verify unmount
    expect(container.querySelector(".home")).toBe(null);
    expect(container.querySelector(".fallback")).toBeTruthy();
    expect(homeUnmounted).toBe(true);
    expect(fallbackUnmounted).toBe(false);
  });
});
