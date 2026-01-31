import { describe, expect, it } from "vitest";
import { normalizePath } from "./normalize-path";

describe("normalizePath", () => {
  it("should remove trailing slashes", () => {
    expect(normalizePath("/user/")).toBe("/user");
    expect(normalizePath("/user//")).toBe("/user");
    expect(normalizePath("/")).toBe("");
  });

  it("should not remove leading slashes", () => {
    expect(normalizePath("/user")).toBe("/user");
  });

  it("should handle empty string", () => {
    expect(normalizePath("")).toBe("");
  });
});
