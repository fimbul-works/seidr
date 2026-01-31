import { describe, expect, it } from "vitest";
import { createServerFragment as ServerFragment } from "./server-fragment";
import { createServerHTMLElement as ServerHTMLElement } from "./server-html-element";

describe("ServerFragment", () => {
  it("should serialize to markers", () => {
    const fragment = ServerFragment("test");
    expect(fragment.toString()).toBe("<!--s:test--><!--e:test-->");
  });

  it("should serialize with children", () => {
    const fragment = ServerFragment("test");
    const div = ServerHTMLElement("div");
    fragment.appendChild(div as any);
    fragment.appendChild("text");

    expect(fragment.toString()).toBe("<!--s:test--><div></div>text<!--e:test-->");
  });

  it("should work as child of ServerHTMLElement", () => {
    const parent = ServerHTMLElement("section");
    const fragment = ServerFragment("range");
    fragment.appendChild("content");
    parent.appendChild(fragment as any);

    expect(parent.toString()).toBe("<section><!--s:range-->content<!--e:range--></section>");
  });

  it("should handle nested fragments", () => {
    const f1 = ServerFragment("outer");
    const f2 = ServerFragment("inner");
    f2.appendChild("data");
    f1.appendChild(f2 as any);

    expect(f1.toString()).toBe("<!--s:outer--><!--s:inner-->data<!--e:inner--><!--e:outer-->");
  });
});
