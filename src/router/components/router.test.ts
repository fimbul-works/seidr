import { afterEach, beforeEach, expect, it } from "vitest";
import { type ComponentFactoryFunction, component } from "../../component";
import { mount } from "../../dom";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { describeDualMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { getCurrentPath } from "../get-current-path";
import { useNavigate } from "../hooks/use-navigate";
import { useParams } from "../hooks/use-params";
import { Router } from "./router";

describeDualMode("Router Component", ({ getDocument, isSSR }) => {
  if (isSSR) {
    it("should be covered by router-ssr.test.ts", () => {
      expect(true).toBe(true);
    });
    return;
  }

  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDocument();
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
  const User = component(() => {
    const params = useParams();
    return $("div", {
      id: "user",
      textContent: params.as((p) => `User Component ${p.id}`),
    });
  }, "User");
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

    const navigate = useNavigate();
    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();
    expect(document.getElementById("about")).toBeFalsy();

    navigate("/about");

    expect(container.outerHTML).not.toContain("Home Component");
    expect(container.outerHTML).toContain("About Component");
  });

  it("should render fallback if no route matches", () => {
    const App = component(() => Router([["/", Home]], Fallback), "App");

    const navigate = useNavigate();
    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();

    navigate("/unknown");
    expect(document.getElementById("home")).toBeFalsy();
    expect(document.getElementById("fallback")).toBeTruthy();

    navigate("/");
    expect(document.getElementById("fallback")).toBeFalsy();
    expect(document.getElementById("home")).toBeTruthy();
  });

  it("should provide dynamic parameters to components via useParams", () => {
    const App = component(() => Router([["/user/:id", User]]), "App");

    const navigate = useNavigate();
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

    const navigate = useNavigate();
    unmount = mount(App, container);

    navigate("/admin/dashboard");
    expect(container.textContent).toContain("Admin");

    navigate("/user/789/edit");
    expect(container.textContent).toContain("Edit User");
  });

  it("should support RegExp patterns with useParams", () => {
    const App = component(
      () =>
        Router([
          [
            /^\/post\/(?<id>\d+)$/,
            component(() => {
              const params = useParams();
              return $("div", { textContent: params.as((p) => `Post ${p.id}`) });
            }),
          ],
        ]),
      "App",
    );

    const navigate = useNavigate();
    unmount = mount(App, container);

    navigate("/post/123");
    expect(container.textContent).toContain("Post 123");

    navigate("/post/abc"); // No match
    expect(container.textContent).not.toContain("Post 123");
  });

  it("should support reactive routes and update dynamically", () => {
    const CompA = component(() => $("div", { id: "comp-a", textContent: "Component A" }), "CompA");
    const CompB = component(() => $("div", { id: "comp-b", textContent: "Component B" }), "CompB");

    const dynamicRoutes = new Seidr<import("../types").RouteDefinition[]>([["/a", CompA]]);
    const App = component(() => Router(dynamicRoutes), "App");

    const navigate = useNavigate();
    navigate("/b");
    unmount = mount(App, container);

    expect(document.getElementById("comp-a")).toBeFalsy();
    expect(document.getElementById("comp-b")).toBeFalsy();

    dynamicRoutes.value = [
      ["/a", CompA],
      ["/b", CompB],
    ];

    // Router should automatically detect the new routes array and match /b
    expect(document.getElementById("comp-b")).toBeTruthy();

    const CompC = component(() => $("div", { id: "comp-c", textContent: "Component C" }), "CompC");
    dynamicRoutes.value = [["/b", CompC]];

    // Router should automatically swap CompB with CompC at /b
    expect(document.getElementById("comp-b")).toBeFalsy();
    expect(document.getElementById("comp-c")).toBeTruthy();
  });

  it("should support reactive fallback component", () => {
    const Fallback1 = component(() => $("div", { id: "fallback-1", textContent: "Fallback 1" }), "Fallback1");
    const Fallback2 = () => $("div", { id: "fallback-2", textContent: "Fallback 2" });

    const dynamicFallback = new Seidr<ComponentFactoryFunction | undefined>(Fallback1);
    const App = component(() => Router([], dynamicFallback), "App");

    const navigate = useNavigate();
    navigate("/unknown");
    unmount = mount(App, container);

    expect(document.getElementById("fallback-1")).toBeTruthy();

    dynamicFallback.value = Fallback2;
    expect(document.getElementById("fallback-1")).toBeFalsy();
    expect(document.getElementById("fallback-2")).toBeTruthy();
  });
});
