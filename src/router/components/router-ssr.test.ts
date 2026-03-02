import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../../constants";
import { $ } from "../../element";
import { renderToString } from "../../ssr";
import { clearHydrationData } from "../../ssr/hydrate";
import { setSSRScope } from "../../ssr/ssr-scope/set-ssr-scope";
import { enableSSRMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { useNavigate, useParams } from "../hooks";
import { Router } from "./router";

describe("Router SSR", () => {
  let cleanupEnv: CleanupFunction;

  beforeEach(() => {
    cleanupEnv = enableSSRMode();
  });

  afterEach(() => {
    setSSRScope(undefined);
    cleanupEnv();
    clearHydrationData();
  });

  const Home = component(() => $("div", { className: "home", textContent: "Home Component" }), "Home");
  const About = component(() => $("div", { className: "about", textContent: "About Component" }), "About");
  const Fallback = component(() => $("div", { className: "fallback", textContent: "404 Component" }), "Fallback");

  it("should render matching route to string", async () => {
    const App = component(
      () =>
        Router(
          [
            ["/", Home],
            ["/about", About],
          ],
          Fallback,
        ),
      "App",
    );

    const { html } = await renderToString(App, { path: "/" });
    expect(html).toContain('class="home"');
    expect(html).toContain("Home Component");
    expect(html).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Router-`);
    expect(html).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Router-`);
    expect(html).not.toContain("About Component");
  });

  it("should render another route to string", async () => {
    const App = component(
      () =>
        Router(
          [
            ["/", Home],
            ["/about", About],
          ],
          Fallback,
        ),
      "App",
    );

    const { html } = await renderToString(App, { path: "/about" });
    expect(html).toContain('class="about"');
    expect(html).toContain("About");
    expect(html).not.toContain("Home");
  });

  it("should render fallback to string when no match", async () => {
    const App = component(() => Router([["/", Home]], Fallback), "App");

    const { html } = await renderToString(App, { path: "/not-found" });
    expect(html).toContain('class="fallback"');
    expect(html).toContain("404");
  });

  it("should handle dynamic params in SSR via useParams", async () => {
    const User = component(() => {
      const params = useParams();
      return $("div", { className: "user", textContent: params.as((p: any) => `User ${p.id}`) });
    }, "User");
    const App = component(() => Router([["/user/:id", User]], Fallback), "App");

    const { html } = await renderToString(App, { path: "/user/123" });
    expect(html).toContain("User 123");
  });

  it("should handle RegExp patterns in SSR via useParams", async () => {
    const Post = component(() => {
      const params = useParams();
      return $("div", { className: "post", textContent: params.as((p: any) => `Post ${p.id}`) });
    }, "Post");
    const App = component(() => Router([[/^\/post\/(?<id>\d+)$/, Post]], Fallback), "App");

    const { html } = await renderToString(App, { path: "/post/456" });
    expect(html).toContain("Post 456");
  });

  it("should handle navigate during SSR render", async () => {
    let navigateWasCalled = false;

    const TestComponent = component(() => {
      const navigate = useNavigate();
      navigateWasCalled = true;
      navigate("/");
      return $("div", { textContent: "Test Component" });
    }, "Test");

    const { html } = await renderToString(TestComponent);
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Test Component");
  });

  it("should isolate path between SSR requests", async () => {
    const AboutPage = component(() => $("div", { textContent: "About Page" }), "AboutPage");
    const HomePage = component(() => $("div", { textContent: "Home Page" }), "HomePage");

    const App = component(
      () =>
        Router(
          [
            ["/about", AboutPage],
            ["/", HomePage],
          ],
          Fallback,
        ),
      "App",
    );

    const result1 = await renderToString(App, { path: "/about" });
    expect(result1.html).toContain("About Page");

    const result2 = await renderToString(App, { path: "/" });
    expect(result2.html).toContain("Home Page");
    expect(result2.html).not.toContain("About Page");
  });

  it("should use default path when initialPath is not provided", async () => {
    const App = component(
      () =>
        Router([
          ["/", () => $("div", { textContent: "Home" })],
          ["/about", () => $("div", { textContent: "About" })],
        ]),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain("Home");
  });
});
