import { createComponent, createRef, createValue, mount } from "@fimbul-works/seidr";
import { $button, $div, $span } from "@fimbul-works/seidr/html";
import { describe, expect, it } from "vitest";
import { useTagName } from "./use-tag-name.js";

describe("useTagName", () => {
  it("uses tagName from element ref", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const ref = createRef<HTMLButtonElement>();
    const tagName = useTagName(ref, "div");

    const Comp = createComponent(() => $button({ ref }, "Click"));
    const unmount = mount(Comp, container);

    expect(tagName()).toBe("button");

    unmount();
    container.remove();
  });

  it("uses fallback when ref is undefined or empty", () => {
    const ref = createRef<HTMLDivElement>();
    const tagName = useTagName(ref, "span");

    expect(tagName()).toBe("span");
  });

  it("updates reactively when ref points to another element", () => {
    const ref = createRef<HTMLElement>();
    const tagName = useTagName(ref, "fallback");

    expect(tagName()).toBe("fallback");

    const spanEl = document.createElement("span");
    ref(spanEl);
    expect(tagName()).toBe("span");

    const divEl = document.createElement("div");
    ref(divEl);
    expect(tagName()).toBe("div");

    ref(null);
    expect(tagName()).toBe("fallback");
  });

  it("supports reactive Value for fallback", () => {
    const ref = createRef<HTMLElement>();
    const fallback = createValue("section");
    const tagName = useTagName(ref, fallback);

    expect(tagName()).toBe("section");

    fallback("article");
    expect(tagName()).toBe("article");
  });
});
