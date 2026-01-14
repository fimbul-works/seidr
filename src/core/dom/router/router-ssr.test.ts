import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearHydrationData } from "../../../ssr/hydration-context";
import { renderToString } from "../../../ssr/render-to-string";
import { setActiveSSRScope } from "../../../ssr/ssr-scope";
import { component } from "../component";
import { $ } from "../element";
import { createRoute } from "./create-route";
import { Router } from "./router";

const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("Router SSR", () => {
  beforeEach(() => {
    // Enable SSR mode
    // @ts-expect-error
    process.env.SEIDR_TEST_SSR = "true";
  });

  afterEach(() => {
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }
    setActiveSSRScope(undefined);
    clearHydrationData();
  });

  const Home = component(() => $("div", { className: "home", textContent: "Home" }));
  const About = component(() => $("div", { className: "about", textContent: "About" }));
  const Fallback = component(() => $("div", { className: "fallback", textContent: "404" }));

  it("should render matching route to string", async () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/", Home), createRoute("/about", About)],
        fallback: Fallback,
      }),
    );

    const { html } = await renderToString(() => App(), { path: "/" });
    expect(html).toContain('class="home"');
    expect(html).toContain("Home");
    expect(html).toContain("router-start:ctx-");
    expect(html).toContain("router-end:ctx-");
    expect(html).not.toContain("About");
  });

  it("should render another route to string", async () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/", Home), createRoute("/about", About)],
        fallback: Fallback,
      }),
    );

    const { html } = await renderToString(() => App(), { path: "/about" });
    expect(html).toContain('class="about"');
    expect(html).toContain("About");
    expect(html).not.toContain("Home");
  });

  it("should render fallback to string when no match", async () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/", Home)],
        fallback: Fallback,
      }),
    );

    const { html } = await renderToString(() => App(), { path: "/not-found" });
    expect(html).toContain('class="fallback"');
    expect(html).toContain("404");
  });

  it("should handle dynamic params in SSR", async () => {
    const User = component((params: any) =>
      $("div", { className: "user", textContent: params.as((p: any) => `User ${p.id}`) }),
    );

    const App = component(() =>
      Router({
        routes: [createRoute("/user/:id", User)],
      }),
    );

    const { html } = await renderToString(() => App(), { path: "/user/123" });
    expect(html).toContain("User 123");
  });
});
