import { describe, expect, it } from "vitest";
import { parseRouteParams } from "./parse-route-params.js";

describe("parseRouteParams", () => {
  it("should match static routes", () => {
    expect(parseRouteParams("/", "/")).toEqual({});
    expect(parseRouteParams("/about", "/about")).toEqual({});
  });

  it("should match everything with root pattern (prefix matching)", () => {
    expect(parseRouteParams("/", "/about")).toEqual({});
  });

  it("should return false on mismatch", () => {
    expect(parseRouteParams("/about", "/contact")).toBe(false);
    expect(parseRouteParams("/user/:id", "/about")).toBe(false);
  });

  it("should parse dynamic parameters", () => {
    expect(parseRouteParams("/user/:id", "/user/123")).toEqual({ id: "123" });
    expect(parseRouteParams("/user/:id/edit", "/user/456/edit")).toEqual({ id: "456" });
  });

  it("should support prefix matching for nested routes", () => {
    expect(parseRouteParams("/user/:id", "/user/123/settings")).toEqual({ id: "123" });
    expect(parseRouteParams("/api/v1", "/api/v1/user/789")).toEqual({});
  });

  it("should handle trailing slashes consistently", () => {
    expect(parseRouteParams("/user/:id/", "/user/123")).toEqual({ id: "123" });
    expect(parseRouteParams("/user/:id", "/user/123/")).toEqual({ id: "123" });
  });

  it("should support wildcard matching", () => {
    expect(parseRouteParams("*", "/about/me")).toEqual({ "*": "about/me" });
    expect(parseRouteParams("/admin/*", "/admin/settings/security")).toEqual({ "*": "settings/security" });
    expect(parseRouteParams("/admin/*", "/admin")).toEqual({ "*": "" });
  });

  it("should support wildcard matching with prefix logic", () => {
    expect(parseRouteParams("/pages/*", "/pages/home/welcome")).toEqual({ "*": "home/welcome" });
  });
});
