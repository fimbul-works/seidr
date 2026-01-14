import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { createRoute } from "./create-route";
import { getCurrentPath } from "./get-current-path";
import { Router } from "./router";

vi.mock("./get-current-path", () => ({
  getCurrentPath: vi.fn(),
}));

describe("Router Component", () => {
  let container: HTMLDivElement;
  let pathSeidr: Seidr<string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    pathSeidr = new Seidr("/");
    vi.mocked(getCurrentPath).mockReturnValue(pathSeidr);
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

    mount(App(), container);
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".about")).toBeFalsy();

    pathSeidr.value = "/about";
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

    mount(App(), container);
    expect(container.querySelector(".home")).toBeTruthy();

    pathSeidr.value = "/unknown";
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".fallback")).toBeTruthy();

    pathSeidr.value = "/";
    expect(container.querySelector(".fallback")).toBeFalsy();
    expect(container.querySelector(".home")).toBeTruthy();
  });

  it("should pass dynamic parameters to components", () => {
    const App = component(() =>
      Router({
        routes: [createRoute("/user/:id", User)],
      }),
    );

    pathSeidr.value = "/user/123";
    mount(App(), container);

    const userEl = container.querySelector(".user")!;
    expect(userEl.textContent).toBe("User 123");

    pathSeidr.value = "/user/456";
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

    mount(App(), container);

    pathSeidr.value = "/admin/dashboard";
    expect(container.textContent).toBe("Admin");

    pathSeidr.value = "/user/789/edit";
    expect(container.textContent).toBe("Edit User");
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

    mount(App(), container);

    pathSeidr.value = "/post/123";
    expect(container.textContent).toBe("Post 123");

    pathSeidr.value = "/post/abc"; // No match
    expect(container.textContent).toBe("");
  });
});
