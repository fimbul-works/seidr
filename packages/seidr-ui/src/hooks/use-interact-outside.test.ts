import { createComponent, createRef, createValue, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInteractOutside } from "./use-interact-outside.js";

describe("useInteractOutside", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("detects pointerdown outside target element", async () => {
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();
    const targetRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useInteractOutside(targetRef, {
        onPointerDownOutside,
        onInteractOutside,
      });
      return $div({}, [$div({ ref: targetRef, id: "inside" }, "Inside"), $div({ id: "outside" }, "Outside")]);
    });

    const unmount = mount(Comp, container);

    // Wait for the next tick for pointerdown listener registration
    await new Promise((resolve) => setTimeout(resolve, 10));

    const insideEl = container.querySelector("#inside")!;
    const outsideEl = container.querySelector("#outside")!;

    // Pointer down inside should not trigger handlers
    insideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onInteractOutside).not.toHaveBeenCalled();

    // Pointer down outside should trigger handlers
    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("detects focus outside target element", async () => {
    const onFocusOutside = vi.fn();
    const targetRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useInteractOutside(targetRef, {
        onFocusOutside,
      });
      return $div({}, [$div({ ref: targetRef, id: "inside", tabIndex: 0 }), $div({ id: "outside", tabIndex: 0 })]);
    });

    const unmount = mount(Comp, container);

    const insideEl = container.querySelector("#inside")!;
    const outsideEl = container.querySelector("#outside")!;

    insideEl.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(onFocusOutside).not.toHaveBeenCalled();

    outsideEl.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(onFocusOutside).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("respects isDisabled prop", async () => {
    const onPointerDownOutside = vi.fn();
    const targetRef = createRef<HTMLDivElement>();
    const isDisabled = createValue(true);

    const Comp = createComponent(() => {
      useInteractOutside(targetRef, {
        isDisabled,
        onPointerDownOutside,
      });
      return $div({}, [$div({ ref: targetRef, id: "inside" }), $div({ id: "outside" })]);
    });

    const unmount = mount(Comp, container);
    await new Promise((resolve) => setTimeout(resolve, 10));

    const outsideEl = container.querySelector("#outside")!;
    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).not.toHaveBeenCalled();

    // Enable
    isDisabled(false);
    await new Promise((resolve) => setTimeout(resolve, 10));

    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("excludes elements matching shouldExcludeElement", async () => {
    const onPointerDownOutside = vi.fn();
    const targetRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useInteractOutside(targetRef, {
        shouldExcludeElement: (el) => el.id === "excluded",
        onPointerDownOutside,
      });
      return $div({}, [$div({ ref: targetRef, id: "inside" }), $div({ id: "excluded" }), $div({ id: "outside" })]);
    });

    const unmount = mount(Comp, container);
    await new Promise((resolve) => setTimeout(resolve, 10));

    const excludedEl = container.querySelector("#excluded")!;
    const outsideEl = container.querySelector("#outside")!;

    excludedEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).not.toHaveBeenCalled();

    outsideEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);

    unmount();
  });
});
