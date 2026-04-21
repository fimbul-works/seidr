import { describe, expect, it } from "vitest";
import { some } from "./some";

describe("some", () => {
  it("should return true if some elements satisfy the predicate", () => {
    expect(some([1, 2, 3], (x: number) => x > 2)).toBe(true);
  });

  it("should return false if no elements satisfy the predicate", () => {
    expect(some([1, 2, 3], (x: number) => x > 3)).toBe(false);
  });

  it("should return false for an empty array", () => {
    expect(some([], (x: number) => x > 2)).toBe(false);
  });

  it("should work with NodeListOf", () => {
    const container = document.createElement("div");
    container.innerHTML = "<span></span><span></span>";
    const spans = container.querySelectorAll("span");

    expect(some(spans, (s: HTMLSpanElement) => s.tagName === "SPAN")).toBe(true);
    expect(some(spans, (s: HTMLSpanElement) => s.tagName === "DIV")).toBe(false);
  });
});
