import { describe, expect, it } from "vitest";
import { createServerComment } from "./server-comment";

describe("ServerComment", () => {
  it("should stringify comment", () => {
    const comment = createServerComment("some comment");
    expect(comment.toString()).toBe("<!--some comment-->");
  });
});
