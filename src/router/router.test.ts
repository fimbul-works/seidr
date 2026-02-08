import { beforeEach, expect, it } from "vitest";
import { component } from "../component/internal";
import { mount } from "../dom/internal";
import { $ } from "../element";
import type { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { createRoute } from "./create-route";
import { initRouter } from "./init-router";
import { navigate } from "./navigate";
import { Router } from "./router";

describeDualMode("Router Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;

  beforeEach(() => {
    const document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    initRouter("/");
  });

  const Home = component(() => $("div", { className: "home", textContent: "Home" }));
  const About = component(() => $("div", { className: "about", textContent: "About" }));
  const User = component((params: Seidr<{ id: string }>) =>
    $("div", {
      className: "user",
      textContent: params.as((p) => `User ${p.id}`),
    }),
  );
  const Fallback = component(() => $("div", { className: "fallback", textContent: "404" }));

  it("should render the matching route", () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/", Home), createRoute("/about", About)],
      }),
    );

    mount(App, container);
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".about")).toBeFalsy();

    navigate("/about");
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".about")).toBeTruthy();
  });

  it("should render fallback if no route matches", () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/", Home)],
        fallback: Fallback,
      }),
    );

    mount(App, container);
    expect(container.querySelector(".home")).toBeTruthy();

    navigate("/unknown");
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".fallback")).toBeTruthy();

    navigate("/");
    expect(container.querySelector(".fallback")).toBeFalsy();
    expect(container.querySelector(".home")).toBeTruthy();
  });

  it("should pass dynamic parameters to components", () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/user/:id", User)],
      }),
    );

    navigate("/user/123");
    mount(App, container);

    const userEl = container.querySelector(".user")!;
    expect(userEl.textContent).toBe("User 123");

    navigate("/user/456");
    expect(userEl.textContent).toBe("User 456");
  });

  it("should handle nested routes or complex patterns", () => {
    const App = component(() =>
      Router({
        routes: [
          createRoute(
            "/admin/dashboard",
            component(() => $("div", { textContent: "Admin" })),
          ),
          createRoute(
            "/user/:id/edit",
            component(() => $("div", { textContent: "Edit User" })),
          ),
        ],
      }),
    );

    mount(App, container);

    navigate("/admin/dashboard");
    expect(container.textContent).toContain("Admin");

    navigate("/user/789/edit");
    expect(container.textContent).toContain("Edit User");
  });

  it("should support RegExp patterns", () => {
    const App = component(() =>
      Router({
        routes: [
          createRoute(
            /^\/post\/(?<id>\d+)$/,
            component((params: Seidr<{ id: string }>) => $("div", { textContent: params.as((p) => `Post ${p.id}`) })),
          ),
        ],
      }),
    );

    mount(App, container);

    navigate("/post/123");
    expect(container.textContent).toContain("Post 123");

    navigate("/post/abc"); // No match
    expect(container.textContent).not.toContain("Post 123");
  });
});
