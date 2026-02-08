import { expect, it } from "vitest";
import { component } from "../component";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { createRoute } from "./create-route";

describeDualMode("createRoute", () => {
  it("should create a route definition with string pattern", () => {
    const Home = component(() => $("div", { textContent: "Home" }));
    const route = createRoute("/", Home);
    expect(route.pattern).toBe("/");
    expect(route.componentFactory).toBe(Home);
  });

  it("should create a route definition with RegExp pattern", () => {
    const Post = component(() => $("div", { textContent: "Post" }));
    const pattern = /^\/post\/\d+$/;
    const route = createRoute(pattern, Post);
    expect(route.pattern).toBe(pattern);
    expect(route.componentFactory).toBe(Post);
  });
});
