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
    // In a real app, you'd check auth state BEFORE rendering and set the correct initialPath

    let navigateWasCalled = false;

    const LoginPage = () =>
      component(() => {
        // In a real app, this would check auth and redirect
        // But during SSR, the redirect doesn't cause a re-render
        navigateWasCalled = true;
        navigate("/");

        return $div({ textContent: "Login Page" });
      });

    const HomePage = () =>
      component(() => {
        return $div({ textContent: "Home Page" });
      });

    const makeApp = () =>
      component(() => {
        return $div({}, [Route("/login", () => LoginPage()), Route("/", () => HomePage())]);
      });

    // Render with initial path as /login
    const { html } = await renderToString(makeApp, null, {
      path: "/login",
    });

    // Verify navigate was called but component still rendered (SSR is single-pass)
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Login Page");

    // The proper way to handle redirects in SSR is to check BEFORE rendering
    // and set initialPath to the redirected path
  });

  it("should handle multiple navigates during SSR render", async () => {
    // SSR is a single-pass render, so multiple navigates don't cause re-renders
    // This test verifies that navigate() can be called multiple times without errors

    let navigateCount = 0;

    const ComponentA = () =>
      component(() => {
        navigateCount++;
        navigate("/b");
        return $div({ textContent: "Component A" });
      });

    const ComponentB = () =>
      component(() => {
        navigateCount++;
        navigate("/c");
        return $div({ textContent: "Component B" });
      });

    const ComponentC = () =>
      component(() => {
        navigateCount++;
        // No more navigates
        return $div({ textContent: "Component C" });
      });

    const makeApp = () =>
      component(() => {
        return $div({}, [
          Route("/a", () => ComponentA()),
          Route("/b", () => ComponentB()),
          Route("/c", () => ComponentC()),
        ]);
      });

    // Start at /a
    const { html } = await renderToString(makeApp, null, {
      path: "/a",
    });

    // Navigate was called (at least once), and only Component A is rendered (SSR is single-pass)
    expect(navigateCount).toBeGreaterThanOrEqual(1);
    expect(html).toContain("Component A");
  });

  it("should isolate path between SSR requests", async () => {
    // Request 1: Render /about
    const AboutPage = () => component(() => $div({ textContent: "About" }));
    const HomePage = () => component(() => $div({ textContent: "Home" }));

    const makeApp = () =>
      component(() => {
        return $div({}, [Route("/about", () => AboutPage()), Route("/", () => HomePage())]);
      });

    const result1 = await renderToString(makeApp, null, {
      path: "/about",
    });

    expect(result1.html).toContain("About");

    // Request 2: Render / (should NOT show "About" from previous request)
    const result2 = await renderToString(makeApp, null, {
      path: "/",
    });

    expect(result2.html).toContain("Home");
    expect(result2.html).not.toContain("About");
  });

  it("should use default path when initialPath is not provided", async () => {
    const HomePage = () => component(() => $div({ textContent: "Home" }));
    const AboutPage = () => component(() => $div({ textContent: "About" }));

    const makeApp = () =>
      component(() => {
        return $div({}, [Route("/", () => HomePage()), Route("/about", () => AboutPage())]);
      });

    // No initialPath provided - should default to "/"
    const { html } = await renderToString(makeApp);

    expect(html).toContain("Home");
  });
});
