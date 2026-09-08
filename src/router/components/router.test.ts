import { createComponent } from "../../component/create-component.js";
import type { SeidrComponentFactoryPureFunction } from "../../component/types.js";
import { mount } from "../../dom/mount.js";
import { $div } from "../../elements/div.js";
import { createValue } from "../../observable/value.js";
import { describeDualMode } from "../../test-setup/dual-mode.js";
import type { CleanupFunction } from "../../types.js";
import { afterEach, beforeEach, expect, it } from "vitest";
import { useNavigate } from "../hooks/use-navigate.js";
import { useRouteParams } from "../hooks/use-route-params.js";
import { initRouter } from "../init-router.js";
import type { Route } from "../types.js";
import { Router } from "./router.js";

describeDualMode("Router Component", ({ getDocument }) => {
  let container: HTMLDivElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    initRouter("/");
  });

  afterEach(() => {
    unmount?.();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  const Home = createComponent(() => $div({ id: "home", textContent: "Home Component" }), "Home");
  const About = createComponent(() => $div({ id: "about", textContent: "About Component" }), "About");
  const User = createComponent(() => {
    const params = useRouteParams();
    return $div({
      id: "user",
      textContent: params.as((p) => `User Component ${p.id}`),
    });
  }, "User");
  const Fallback = createComponent(() => $div({ id: "fallback", textContent: "404" }), "Fallback");

  it("should render the matching route", () => {
    const App = createComponent(
      () =>
        Router([
          { path: "/", component: Home, exact: true },
          { path: "/about", component: About },
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

  it("should render wildcard route if no specific route matches", () => {
    const App = createComponent(
      () =>
        Router([
          { path: "/", component: Home, exact: true },
          { path: "*", component: Fallback },
        ]),
      "App",
    );

    const navigate = useNavigate();
    unmount = mount(App, container);
    expect(document.getElementById("home")).toBeTruthy();

    navigate("/unknown");
    expect(container.innerHTML).not.toContain('id="home"');
    expect(container.innerHTML).toContain('id="fallback"');

    navigate("/");
    expect(container.innerHTML).not.toContain('id="fallback"');
    expect(container.innerHTML).toContain('id="home"');
  });

  it("should provide dynamic parameters to components via useRouteParams", () => {
    const App = createComponent(() => Router([{ path: "/user/:id", component: User }]), "App");

    const navigate = useNavigate();
    navigate("/user/123");
    unmount = mount(App, container);

    const userEl = document.getElementById("user")!;
    expect(userEl.textContent).toBe("User Component 123");

    navigate("/user/456");
    expect(userEl.textContent).toBe("User Component 456");
  });

  it("should handle nested routes or complex patterns", () => {
    const App = createComponent(
      () =>
        Router([
          { path: "/admin/dashboard", component: createComponent(() => $div({ textContent: "Admin" })) },
          { path: "/user/:id/edit", component: createComponent(() => $div({ textContent: "Edit User" })) },
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

  it("should support RegExp patterns with useRouteParams", () => {
    const App = createComponent(
      () =>
        Router([
          {
            path: /^\/post\/(?<id>\d+)$/,
            component: () => {
              const params = useRouteParams();
              return $div({ textContent: params.as((p) => `Post ${p.id}`) });
            },
          },
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
    const CompA = createComponent(() => $div({ id: "comp-a", textContent: "Component A" }), "CompA");
    const CompB = createComponent(() => $div({ id: "comp-b", textContent: "Component B" }), "CompB");

    const dynamicRoutes = createValue<Route[]>([{ path: "/a", component: CompA }]);
    const App = createComponent(() => Router(dynamicRoutes), "App");

    const navigate = useNavigate();
    navigate("/b");
    unmount = mount(App, container);

    expect(document.getElementById("comp-a")).toBeFalsy();
    expect(document.getElementById("comp-b")).toBeFalsy();

    dynamicRoutes([
      { path: "/a", component: CompA },
      { path: "/b", component: CompB },
    ]);

    // Router should automatically detect the new routes array and match /b
    expect(container.innerHTML).toContain('id="comp-b"');

    const CompC = createComponent(() => $div({ id: "comp-c", textContent: "Component C" }), "CompC");
    dynamicRoutes([{ path: "/b", component: CompC }]);

    // Router should automatically swap CompB with CompC at /b
    expect(container.innerHTML).not.toContain('id="comp-b"');
    expect(container.innerHTML).toContain('id="comp-c"');
  });

  it("should support reactive wildcard component", () => {
    const Fallback1 = createComponent(() => $div({ id: "fallback-1", textContent: "Fallback 1" }), "Fallback1");
    const Fallback2 = createComponent(() => $div({ id: "fallback-2", textContent: "Fallback 2" }), "Fallback2");

    const dynamicFallback = createValue<SeidrComponentFactoryPureFunction>(Fallback1);
    const App = createComponent(() => Router(dynamicFallback.as<Route[]>((f) => [{ path: "*", component: f }])), "App");

    const navigate = useNavigate();
    navigate("/unknown");
    unmount = mount(App, container);

    expect(document.getElementById("fallback-1")).toBeTruthy();

    dynamicFallback(Fallback2);
    expect(container.innerHTML).not.toContain('id="fallback-1"');
    expect(container.innerHTML).toContain('id="fallback-2"');
  });

  it("should capture wildcard content in params", () => {
    let capturedParams: any;
    const WildcardComp = createComponent(() => {
      capturedParams = useRouteParams();
      return $div({ textContent: capturedParams.as((p: any) => `Path: ${p["*"]}`) });
    });

    const App = createComponent(() => Router([{ path: "/admin/*", component: WildcardComp }]), "App");

    const navigate = useNavigate();
    unmount = mount(App, container);

    navigate("/admin/settings/profile");
    expect(capturedParams()["*"]).toBe("settings/profile");
    expect(container.textContent).toContain("Path: settings/profile");
  });
});
