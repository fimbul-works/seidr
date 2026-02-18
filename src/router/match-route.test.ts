import { afterEach, expect, it } from "vitest";
import { wrapComponent } from "../component/internal";
import { mount } from "../dom/internal";
import { $div } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { matchRoute } from "./match-route";
import type { RouteDefinition } from "./types";

describeDualMode("matchRoute", () => {
  const comp = () => $div();
  let unmount: CleanupFunction;

  afterEach(() => {
    unmount?.();
  });

  it("should match simple path", () => {
    const route: RouteDefinition = ["/home", comp];
    const match = matchRoute("/home", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
  });

  it("should match route with parameters", () => {
    const route: RouteDefinition = [
      "/user/:id",
      (params?: Seidr<{ id: string }>) => $div({ textContent: params?.as((p) => p.id) }),
    ];
    const match = matchRoute("/user/123", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ id: "123" });
  });

  it("should match regex route", () => {
    const route: RouteDefinition = [
      /^\/post\/(?<slug>[a-z-]+)$/,
      (params?: Seidr<{ slug: string }>) => $div({ textContent: params?.as((p) => p.slug) }),
    ];
    const match = matchRoute("/post/hello-world", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ slug: "hello-world" });
  });

  it("should prioritize earlier routes", () => {
    const route1: RouteDefinition = ["/user/new", comp];
    const route2: RouteDefinition = [
      "/user/:id",
      (params?: Seidr<{ id: string }>) => $div({ textContent: params?.as((p) => p.id) }),
    ];

    const match = matchRoute("/user/new", [route1, route2]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route1);
    expect(match?.params).toEqual({});
  });

  it("should return null for no match", () => {
    const route: RouteDefinition = ["/home", comp];
    const match = matchRoute("/about", [route]);

    expect(match).toBeNull();
  });

  it("should handle trailing slashes", () => {
    const route: RouteDefinition = ["/home", comp];
    const match = matchRoute("/home/", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
  });

  it("should render component with captured params", async () => {
    const route: RouteDefinition = [
      "/user/:id",
      (params?: Seidr<{ id: string }>) => $div({ textContent: params?.as((p) => `User: ${p.id}`) }),
    ];

    const match = matchRoute("/user/42", [route]);
    expect(match).not.toBeNull();

    if (!match) {
      throw new Error("Route parameters should match");
    }

    const paramsSeidr = new Seidr(match.params);
    const container = $div();
    const factory = wrapComponent(match.route[1]);

    const component = factory(paramsSeidr);
    unmount = mount(component, container);

    expect(container.textContent).toBe("User: 42");
  });
});
