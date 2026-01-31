import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element";
import { clearHydrationData } from "../ssr/hydration-context";
import { renderToString } from "../ssr/render-to-string";
import { setActiveSSRScope } from "../ssr/ssr-scope";
import { enableSSRMode } from "../test-setup";
import { createRoute } from "./create-route";
import { navigate } from "./navigate";
import { Route } from "./route";
import { Router } from "./router";

describe("Router SSR", () => {
  let cleanupEnv: () => void;

  beforeEach(() => {
    // Enable SSR mode
    cleanupEnv = enableSSRMode();
  });

  afterEach(() => {
    setActiveSSRScope(undefined);
    cleanupEnv();
    clearHydrationData();
  });

  const Home = () => $("div", { className: "home", textContent: "Home" });
  const About = () => $("div", { className: "about", textContent: "About" });
  const Fallback = () => $("div", { className: "fallback", textContent: "404" });

  it("should render matching route to string", async () => {
    const App = () =>
      Router({
        routes: [createRoute("/", Home), createRoute("/about", About)],
        fallback: Fallback,
      });

    const { html } = await renderToString(App, { path: "/" });
    expect(html).toContain('class="home"');
    expect(html).toContain("Home");
    expect(html).toContain("router-start:ctx-");
    expect(html).toContain("router-end:ctx-");
    expect(html).not.toContain("About");
  });

  it("should render another route to string", async () => {
    const App = () =>
      Router({
        routes: [createRoute("/", Home), createRoute("/about", About)],
        fallback: Fallback,
      });

    const { html } = await renderToString(App, { path: "/about" });
    expect(html).toContain('class="about"');
    expect(html).toContain("About");
    expect(html).not.toContain("Home");
  });

  it("should render fallback to string when no match", async () => {
    const App = () =>
      Router({
        routes: [createRoute("/", Home)],
        fallback: Fallback,
      });

    const { html } = await renderToString(App, { path: "/not-found" });
    expect(html).toContain('class="fallback"');
    expect(html).toContain("404");
  });

  it("should handle dynamic params in SSR", async () => {
    const User = (params: any) => $("div", { className: "user", textContent: params.as((p: any) => `User ${p.id}`) });

    const App = () =>
      Router({
        routes: [createRoute("/user/:id", User)],
      });

    const { html } = await renderToString(App, { path: "/user/123" });
    expect(html).toContain("User 123");
  });

  it("should handle navigate during SSR render", async () => {
    let navigateWasCalled = false;

    const TestComponent = () => {
      navigateWasCalled = true;
      navigate("/");
      return $("div", { textContent: "Test Component" });
    };

    const { html } = await renderToString(TestComponent);
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Test Component");
  });

  it("should isolate path between SSR requests", async () => {
    const AboutPage = () => $("div", { textContent: "About" });
    const HomePage = () => $("div", { textContent: "Home" });

    const App = () => {
      return $("div", {}, [Route("/about", AboutPage), Route("/", HomePage)]);
    };

    const result1 = await renderToString(App, { path: "/about" });
    expect(result1.html).toContain("About");

    const result2 = await renderToString(App, { path: "/" });
    expect(result2.html).toContain("Home");
    expect(result2.html).not.toContain("About");
  });

  it("should use default path when initialPath is not provided", async () => {
    const App = () =>
      Router({
        routes: [
          createRoute("/", () => $("div", { textContent: "Home" })),
          createRoute("/about", () => $("div", { textContent: "About" })),
        ],
      });

    const { html } = await renderToString(App);
    expect(html).toContain("Home");
  });
});
