import { $div } from "../elements/div.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import { expect, it } from "vitest";
import { useRouteParams } from "./hooks/use-route-params.js";
import { matchRoute } from "./match-route.js";
import type { Route } from "./types.js";

describeDualMode("matchRoute", () => {
  const comp = () => $div();

  it("should match simple path", () => {
    const route: Route = { path: "/home", component: comp };
    const match = matchRoute("/home", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
    expect(match?.matchedPath).toBe("/home");
  });

  it("should match route with search parameters and hash", () => {
    const route: Route = { path: "/home", component: comp };
    const match = matchRoute("/home?foo=bar#baz", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
    expect(match?.matchedPath).toBe("/home");
  });

  it("should match route with parameters", () => {
    const route: Route = {
      path: "/user/:id",
      component: () => {
        const params = useRouteParams();
        return $div({ textContent: params.as((p) => p.id) });
      },
    };
    const match = matchRoute("/user/123", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ id: "123" });
    expect(match?.matchedPath).toBe("/user/123");
  });

  it("should match regex route", () => {
    const route: Route = {
      path: /^\/post\/(?<slug>[a-z-]+)$/,
      component: comp,
    };
    const match = matchRoute("/post/hello-world", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ slug: "hello-world" });
    expect(match?.matchedPath).toBe("/post/hello-world");
  });

  it("should support prefix matching for nested routes", () => {
    const route: Route = { path: "/user/:id", component: comp };
    const match = matchRoute("/user/123/settings", [route]);

    expect(match).not.toBeNull();
    expect(match?.params).toEqual({ id: "123" });
    expect(match?.matchedPath).toBe("/user/123");
  });

  it("should prioritize earlier routes", () => {
    const route1: Route = { path: "/user/new", component: comp };
    const route2: Route = { path: "/user/:id", component: comp };

    const match = matchRoute("/user/new", [route1, route2]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route1);
    expect(match?.params).toEqual({});
  });

  it("should return null for no match", () => {
    const route: Route = { path: "/home", component: comp };
    const match = matchRoute("/about", [route]);

    expect(match).toBeNull();
  });

  it("should handle trailing slashes", () => {
    const route: Route = { path: "/home", component: comp };
    const match = matchRoute("/home/", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.matchedPath).toBe("/home");
  });
});
