import { describeDualMode } from "@fimbul-works/seidr/testing";
import { expect, it } from "vitest";
import { isLinkActive } from "./is-link-active.js";

describeDualMode("isLinkActive utility", () => {
  it("should match simple pathname exactly", () => {
    const url = new URL("http://localhost/about");
    expect(isLinkActive("/about", url)).toBe(true);
    expect(isLinkActive("/contact", url)).toBe(false);
    expect(isLinkActive("/", url)).toBe(false);
  });

  it("should match root path '/' only on root", () => {
    expect(isLinkActive("/", new URL("http://localhost/"))).toBe(true);
    expect(isLinkActive("/", new URL("http://localhost/about"))).toBe(false);
  });

  it("should match query parameters regardless of parameter ordering", () => {
    const url = new URL("http://localhost/search?b=2&a=1");
    expect(isLinkActive("/search?a=1&b=2", url)).toBe(true);
    expect(isLinkActive("/search?a=1&b=3", url)).toBe(false);
  });

  it("should match query parameter subsets when not exact", () => {
    const url = new URL("http://localhost/search?q=foo&page=2");
    expect(isLinkActive("/search?q=foo", url)).toBe(true);
    expect(isLinkActive("/search?q=foo", url, undefined, undefined, true)).toBe(false);
  });

  it("should match route parameters with patterns and values", () => {
    const url = new URL("http://localhost/posts/react-guide");
    expect(isLinkActive("/posts/react-guide", url)).toBe(true);
    expect(isLinkActive("/posts/:slug", url)).toBe(true);
    expect(isLinkActive("/posts/vue-guide", url)).toBe(false);
  });

  it("should match wildcards", () => {
    const url = new URL("http://localhost/docs/api/endpoints/users");
    expect(isLinkActive("/docs/*", url)).toBe(true);
  });

  it("should match URL hashes when specified in 'to'", () => {
    const url = new URL("http://localhost/docs#section-1");
    expect(isLinkActive("/docs#section-1", url)).toBe(true);
    expect(isLinkActive("/docs#section-2", url)).toBe(false);
    // Link without hash matches regardless of current hash
    expect(isLinkActive("/docs", url)).toBe(true);
  });
});
