import { createComponent } from "../../component/create-component.js";
import { $div } from "../../elements/div.js";
import { renderToString } from "../../ssr/render-to-string.js";
import { clearTestAppState, enableSSRMode } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useNavigate } from "../hooks/use-navigate.js";
import { useRouteParams } from "../hooks/use-route-params.js";
import { clearRouterState } from "../test/index.js";
import { Router } from "./router.js";

describe("Router SSR", () => {
  let cleanupEnv: CleanupFunction;

  beforeEach(() => {
    cleanupEnv = enableSSRMode();
    clearRouterState();
    clearTestAppState();
  });

  afterEach(() => {
    cleanupEnv();
  });

  const Home = createComponent(() => $div({ className: "home", textContent: "Home Component" }), "Home");
  const About = createComponent(() => $div({ className: "about", textContent: "About Component" }), "About");
  const Fallback = createComponent(() => $div({ className: "fallback", textContent: "404 Component" }), "Fallback");

  it("should render matching route to string", async () => {
    const App = createComponent(
      () =>
        Router([
          { path: "/", component: Home, exact: true },
          { path: "/about", component: About },
        ]),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="home"');
    expect(html).toContain("Home Component");
    expect(html).not.toContain("About Component");
  });

  it("should render another route to string", async () => {
    const App = createComponent(
      () =>
        Router(
          [
            { path: "/", component: Home, exact: true },
            { path: "/about", component: About },
          ],
          { url: "/about" },
        ),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="about"');
    expect(html).toContain("About Component");
    expect(html).not.toContain("Home Component");
  });

  it("should render wildcard to string when no match", async () => {
    const App = createComponent(
      () =>
        Router(
          [
            { path: "/", component: Home, exact: true },
            { path: "*", component: Fallback },
          ],
          { url: "/not-found" },
        ),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain('class="fallback"');
    expect(html).toContain("404");
  });

  it("should handle dynamic params in SSR via useRouteParams", async () => {
    const User = createComponent(() => {
      const params = useRouteParams();
      return $div({ className: "user", textContent: params.as((p: any) => `User ${p.id}`) });
    }, "User");
    const App = createComponent(() => Router([{ path: "/user/:id", component: User }], { url: "/user/123" }), "App");

    const { html } = await renderToString(App);
    expect(html).toContain("User 123");
  });

  it("should handle RegExp patterns in SSR via useRouteParams", async () => {
    const Post = createComponent(() => {
      const params = useRouteParams();
      return $div({ className: "post", textContent: params.as((p: any) => `Post ${p.id}`) });
    }, "Post");

    const App = createComponent(
      () => Router([{ path: /^\/post\/(?<id>\d+)$/, component: Post }], { url: "/post/456" }),
      "App",
    );

    const { html } = await renderToString(App);
    expect(html).toContain("Post 456");
  });

  it("should handle navigate during SSR render", async () => {
    let navigateWasCalled = false;

    const TestComponent = createComponent(() => {
      const navigate = useNavigate();
      navigateWasCalled = true;
      navigate("/");
      return $div({ textContent: "Test Component" });
    }, "Test");

    const App = createComponent(() => Router([{ path: "/", component: TestComponent }]), "App");

    const { html } = await renderToString(App);
    expect(navigateWasCalled).toBe(true);
    expect(html).toContain("Test Component");
  });

  it("should isolate path between SSR requests", async () => {
    const HomePage = createComponent(() => $div({ textContent: "Home Page" }), "HomePage");
    const AboutPage = createComponent(() => $div({ textContent: "About Page" }), "AboutPage");

    const App = createComponent(
      (url: string) =>
        Router(
          [
            { path: "/", component: HomePage, exact: true },
            { path: "/about", component: AboutPage },
          ],
          { url },
        ),
      "App",
    );

    const result1 = await renderToString(() => App("/about"));
    expect(result1.html).toContain("About Page");

    const result2 = await renderToString(() => App("/"));
    expect(result2.html).toContain("Home Page");
    expect(result2.html).not.toContain("About Page");
  });
});
