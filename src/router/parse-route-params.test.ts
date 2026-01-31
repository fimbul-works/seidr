import { describe, expect, it } from "vitest";
import { parseRouteParams } from "./parse-route-params";

describe("parseRouteParams", () => {
  it("should match static routes", () => {
    expect(parseRouteParams("/", "/")).toEqual({});
    expect(parseRouteParams("/about", "/about")).toEqual({});
    expect(parseRouteParams("/about/", "/about")).toEqual({});
    expect(parseRouteParams("/about", "/about/")).toEqual({});
  });

  it("should return false on mismatch", () => {
    expect(parseRouteParams("/", "/about")).toBe(false);
    expect(parseRouteParams("/about", "/contact")).toBe(false);
    expect(parseRouteParams("/user/:id", "/about")).toBe(false);
  });

  it("should parse dynamic parameters", () => {
    expect(parseRouteParams("/user/:id", "/user/123")).toEqual({ id: "123" });
    expect(parseRouteParams("/user/:id/edit", "/user/456/edit")).toEqual({ id: "456" });
    expect(parseRouteParams("/blog/:year/:month/:day", "/blog/2024/01/14")).toEqual({
      year: "2024",
      month: "01",
      day: "14",
    });
  });

  it("should handle mixed static and dynamic parts", () => {
    expect(parseRouteParams("/api/v1/user/:id", "/api/v1/user/789")).toEqual({ id: "789" });
  });

  it("should handle trailing slashes consistently", () => {
    expect(parseRouteParams("/user/:id/", "/user/123")).toEqual({ id: "123" });
    expect(parseRouteParams("/user/:id", "/user/123/")).toEqual({ id: "123" });
  });
});
