import { describe, expect, it } from "vitest";
import { SSRDocument } from "./index";

describe("ServerTextNode", () => {
  it("should stringify text and escape HTML", () => {
    const doc = new SSRDocument();
    const text = doc.createTextNode("foo <bar>");
    expect(text.toString()).toBe("foo &lt;bar&gt;");
  });

  it("should split text", () => {
    const doc = new SSRDocument();
    const div = doc.createElement("div");
    const text = doc.createTextNode("HelloWorld");
    div.appendChild(text);

    const secondPart = text.splitText(5);
    expect(text.data).toBe("Hello");
    expect(secondPart.data).toBe("World");
    expect(div.childNodes.length).toBe(2);
    expect(div.textContent).toBe("HelloWorld");
  });
});
