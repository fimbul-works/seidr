import { afterEach, beforeEach, expect, it } from "vitest";
import { component } from "../component";
import { mount } from "../dom";
import { $ } from "../element";
import { type Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { getCurrentPath } from "./get-current-path";
import { useNavigate } from "./hooks/use-navigate";
import { Router } from "./router";

describeDualMode("Router Component", ({ getDOMFactory, isSSR }) => {
  if (isSSR) {
    it("should be covered by router-ssr.test.ts", () => {
      expect(true).toBe(true);
    });
    return;
  }

  const { navigate } = useNavigate();

  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    getCurrentPath().value = "/";
  });

  afterEach(() => {
    unmount?.();
    document.body.removeChild(container);
  });

  const Home = component(() => $("div", { id: "home", textContent: "Home Component" }), "Home");
  const About = component(() => $("div", { id: "about", textContent: "About Component" }), "About");
  const User = component(
    (params: Seidr<Record<string, string>>) =>
      $("div", {
        id: "user",
        textContent: params.as((p) => `User Component ${p.id}`),
      }),
    "User",
  );
  const Fallback = component(() => $("div", { id: "fallback", textContent: "404" }), "Fallback");

  it("should render the matching route", () => {
    const App = component(
      () =>
        Router([
          ["/", Home],
          ["/about", About],
        ]),
      "App",
    );

    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();
    expect(document.getElementById("about")).toBeFalsy();

    navigate("/about");

    expect(container.outerHTML).not.toContain("Home Component");
    expect(container.outerHTML).toContain("About Component");
  });

  it("should render fallback if no route matches", () => {
    const App = component(() => Router([["/", Home]], Fallback), "App");

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
    const App = component(() => Router([["/user/:id", User]]), "App");

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
          ["/admin/dashboard", component(() => $("div", { textContent: "Admin" }))],
          ["/user/:id/edit", component(() => $("div", { textContent: "Edit User" }))],
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
          [
            /^\/post\/(?<id>\d+)$/,
            component((params: Seidr<Record<string, string>>) =>
              $("div", { textContent: params.as((p) => `Post ${p.id}`) }),
            ),
          ],
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
