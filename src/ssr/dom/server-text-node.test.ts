import { describe, expect, it } from "vitest";
import { createServerTextNode } from "./server-text-node";

describe("ServerTextNode", () => {
  it("should stringify text and escape HTML", () => {
    const text = createServerTextNode("foo <bar>");
    expect(text.toString()).toBe("foo &lt;bar&gt;");
  });
});
