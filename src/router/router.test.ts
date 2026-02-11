import { afterEach, beforeEach, expect, it } from "vitest";
import { component } from "../component/internal";
import { mount } from "../dom/internal";
import { $ } from "../element";
import type { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { createRoute } from "./create-route";
import { initRouter } from "./init-router";
import { navigate } from "./navigate";
import { Router } from "./router";

describeDualMode("Router Component", ({ getDOMFactory, isSSR }) => {
  type IdParams = { id: string } extends Record<string, string> ? { id: string } : never;

  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    initRouter("/");
  });

  afterEach(() => {
    unmount?.();
    document.body.removeChild(container);
  });

  const Home = component(() => $("div", { id: "home", textContent: "Home Component" }), 'Home');
  const About = component(() => $("div", { id: "about", textContent: "About Component" }), 'About');
  const User = component(
    (params: Seidr<IdParams>) =>
      $("div", {
        id: "user",
        textContent: params.as((p) => `User Component ${p.id}`),
      }),
    "User",
  );
  const Fallback = component(() => $("div", { id: "fallback", textContent: "404" }), "Fallback");

  it("should render the matching route", () => {
    const App = component(() => Router([createRoute("/", Home), createRoute("/about", About)]), "App");

    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();
    expect(document.getElementById("about")).toBeFalsy();

    navigate("/about");

    expect(container.outerHTML).not.toContain("Home Component");
    expect(container.outerHTML).toContain("About Component");
  });

  it("should render fallback if no route matches", () => {
    const App = component(
      () =>
        Router([createRoute("/", Home)], Fallback),
      "App",
    );

    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();

    navigate("/unknown");
    expect(document.getElementById("home")).toBeFalsy();
    expect(document.getElementById("fallback")).toBeTruthy();

    navigate("/");
    expect(document.getElementById("fallback")).toBeFalsy();
    expect(document.getElementById("home")).toBeTruthy();
  });

  it("should pass dynamic parameters to components", () => {
    const App = component(
      () =>
        Router([createRoute<any>("/user/:id", User)]),
      "App",
    );

    navigate("/user/123");
    unmount = mount(App, container);

    const userEl = document.getElementById("user")!;
    expect(userEl.textContent).toBe("User Component 123");

    navigate("/user/456");
    expect(userEl.textContent).toBe("User Component 456");
  });

  it("should handle nested routes or complex patterns", () => {
    const App = component(
      () =>
        Router([
            createRoute(
              "/admin/dashboard",
              component(() => $("div", { textContent: "Admin" })),
            ),
            createRoute(
              "/user/:id/edit",
              component(() => $("div", { textContent: "Edit User" })),
            ),
          ]),
      "App",
    );

    unmount = mount(App, container);

    navigate("/admin/dashboard");
    expect(container.textContent).toContain("Admin");

    navigate("/user/789/edit");
    expect(container.textContent).toContain("Edit User");
  });

  it("should support RegExp patterns", () => {
    const App = component(
      () =>
        Router([
            createRoute<any>(/^\/post\/(?<id>\d+)$/, (params: Seidr<IdParams>) =>
              $("div", { textContent: params.as((p) => `Post ${p.id}`) }),
            ),
          ]),
      "App",
    );

    unmount = mount(App, container);

    navigate("/post/123");
    expect(container.textContent).toContain("Post 123");

    navigate("/post/abc"); // No match
    expect(container.textContent).not.toContain("Post 123");
  });
});
