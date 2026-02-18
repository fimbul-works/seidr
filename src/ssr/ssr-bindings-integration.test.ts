import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element";
import { runWithRenderContext } from "../render-context/render-context.node";
import { Seidr } from "../seidr";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { clearHydrationData, hydrate } from "./hydrate/index";
import { renderToString } from "./render-to-string";
import { SSRScope, setSSRScope } from "./ssr-scope";
import "../dom/dom-factory.node";
import { isClient } from "../util/environment/client";

describe("SSR Reactive Bindings Integration", () => {
  let cleanupMode: CleanupFunction;
  let unmount: CleanupFunction;

  afterEach(() => {
    unmount?.();
  });

  describe("Server-Side Rendering with Reactive Props", () => {
    beforeEach(() => {
      cleanupMode = enableSSRMode();
      process.env.SEIDR_TEST_SSR = "true";
    });

    afterEach(() => {
      cleanupMode();
      setSSRScope(undefined);
      clearHydrationData();
    });

    it("should register observables for reactive props during SSR", async () => {
      await runWithRenderContext(async () => {
        const scope = new SSRScope();
        setSSRScope(scope);

        const isActive = new Seidr(false);
        $("button", { disabled: isActive });

        const hydrationData = scope.captureHydrationData();
        setSSRScope(undefined);

        // Should have captured the observable
        expect(Object.keys(hydrationData.observables)).toHaveLength(1);
        expect(hydrationData.observables[1]).toBe(false);
      });
    });

    it("should render reactive button with correct initial value", async () => {
      await runWithRenderContext(async () => {
        const scope = new SSRScope();
        setSSRScope(scope);

        const isActive = new Seidr(true); // true to get disabled attribute
        const button = $("button", { disabled: isActive, textContent: "Click me" });

        const html = button.toString();
        setSSRScope(undefined);

        // Should render with initial value
        expect(html).toContain("disabled");
        expect(html).toContain("Click me");
      });
    });

    it("should capture all observables used in bindings", async () => {
      await runWithRenderContext(async () => {
        const scope = new SSRScope();
        setSSRScope(scope);

        const count = new Seidr(5);
        const isActive = new Seidr(true);
        $("button", {
          disabled: isActive,
          textContent: count.as((n) => `Count: ${n}`),
        });

        const hydrationData = scope.captureHydrationData();
        setSSRScope(undefined);

        // Should captured all root observables
        expect(Object.keys(hydrationData.observables)).toHaveLength(2);
        expect(hydrationData.observables["1"]).toBe(5);
        expect(hydrationData.observables["2"]).toBe(true);
      });
    });

    it("should work with renderToString and hydrate", async () => {
      const App = () => {
        const count = new Seidr(42);
        return $("button", {
          disabled: count.as((n) => n > 100),
          textContent: count.as((n) => `Count: ${n}`),
        });
      };

      // Server-side
      const { html, hydrationData } = await renderToString(App);

      expect(html).toContain("Count: 42");
      expect(html).not.toContain("disabled"); // 42 is not > 100

      // Check observables were captured
      expect(Object.keys(hydrationData.observables).length).toBeGreaterThan(0);

      // Client-side
      cleanupMode = enableClientMode();
      const container = document.createElement("div");
      unmount = hydrate(App, container, hydrationData);

      expect(String(container.textContent)).toContain("Count: 42");
    });
  });

  describe("Client-Side Hydration with Bindings", () => {
    beforeEach(() => {
      cleanupMode = enableClientMode();
    });

    afterEach(() => {
      unmount?.();
      cleanupMode();
    });

    it("should apply bindings during hydration", async () => {
      const cleanup = enableSSRMode();

      const App = () => {
        const count = new Seidr(isClient() ? 0 : 42);
        return $("button", {
          disabled: count.as((n) => n > 100),
          textContent: count.as((n) => `Count: ${n}`),
        });
      };

      const { hydrationData } = await renderToString(App);
      cleanup();

      const container = document.createElement("div");
      unmount = hydrate(App, container, hydrationData);

      // Should have server values
      expect(container.textContent).toContain("Count: 42");
      cleanupMode();
    });
  });
});
