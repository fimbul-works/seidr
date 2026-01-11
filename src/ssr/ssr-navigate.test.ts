import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../core/dom/component";
import { navigate, Route } from "../core/dom/components/route";
import { $div } from "../core/dom/elements";
import { clearHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";
import { setActiveSSRScope } from "./ssr-scope";

const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Navigate", () => {
  beforeEach(() => {
    // Enable SSR mode for all tests
    // @ts-expect-error
    process.env.SEIDR_TEST_SSR = true;
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Clear active scope
    setActiveSSRScope(undefined);

    // Clear hydration context
    clearHydrationData();
  });

  it("should handle navigate during SSR render", async () => {
    // SSR is a single-pass render, so navigate() doesn't cause re-renders
    // This test verifies that navigate() can be called without errors during SSR

    let navigateWasCalled = false;

    const TestComponent = component(() => {
      // Call navigate during SSR - should not throw
      navigateWasCalled = true;
      navigate("/");

      return $div({ textContent: "Test Component" });
    });

    // Render the component
    const { html } = await renderToString(() => TestComponent());

    // Verify navigate was called and component still rendered
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Test Component");
  });

  it("should handle multiple navigates during SSR render", async () => {
    // SSR is a single-pass render, so multiple navigates don't cause re-renders
    // This test verifies that navigate() can be called multiple times without errors

    let navigateCount = 0;

    const TestComponent = component(() => {
      // Call navigate multiple times during SSR
      navigateCount++;
      navigate("/b");
      navigateCount++;
      navigate("/c");
      navigateCount++;

      return $div({ textContent: "Test Component" });
    });

    // Render the component
    const { html } = await renderToString(() => TestComponent());

    // Verify all navigates were called and component still rendered
    expect(navigateCount).toBe(3);
    expect(html).toContain("Test Component");
  });

  it("should isolate path between SSR requests", async () => {
    // Request 1: Render /about
    const AboutPage = component(() => $div({ textContent: "About" }));
    const HomePage = component(() => $div({ textContent: "Home" }));

    const makeApp = () =>
      component(() => {
        return $div({}, [Route("/about", () => AboutPage()), Route("/", () => HomePage())]);
      });

    const result1 = await renderToString(() => makeApp()(), {
      path: "/about",
    });

    expect(result1.html).toContain("About");

    // Request 2: Render / (should NOT show "About" from previous request)
    const result2 = await renderToString(() => makeApp()(), {
      path: "/",
    });

    expect(result2.html).toContain("Home");
    expect(result2.html).not.toContain("About");
  });

  it("should use default path when initialPath is not provided", async () => {
    const HomePage = component(() => $div({ textContent: "Home" }));
    const AboutPage = component(() => $div({ textContent: "About" }));

    const makeApp = () =>
      component(() => {
        return $div({}, [Route("/", () => HomePage()), Route("/about", () => AboutPage())]);
      });

    // No initialPath provided - should default to "/"
    const { html } = await renderToString(() => makeApp()());

    expect(html).toContain("Home");
  });
});
