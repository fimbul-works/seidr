import { expect, it } from "vitest";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { createRoute } from "./create-route";

describeDualMode("createRoute", () => {
  it("should create a route definition with string pattern", () => {
    const Home = () => $("div", { textContent: "Home" });
    const route = createRoute("/", Home);
    expect(route[0]).toBe("/");
    expect(route[1]).toBe(Home);
  });

  it("should create a route definition with RegExp pattern", () => {
    const Post = () => $("div", { textContent: "Post" });
    const pattern = /^\/post\/\d+$/;
    const route = createRoute(pattern, Post);
    expect(route[0]).toBe(pattern);
    expect(route[1]).toBe(Post);
  });
});
