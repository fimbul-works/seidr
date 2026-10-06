import { describe, expect, it } from "vitest";
import { SSRDocument } from "./ssr-document";

describe("ServerComment", () => {
  it("should stringify comment", () => {
    const doc = new SSRDocument();
    const comment = doc.createComment("some comment");
    expect(comment.toString()).toBe("<!--some comment-->");
  });
});
