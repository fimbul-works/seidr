import { createComponent, createRef, createValue, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useHideOutside } from "./use-hide-outside.js";

describe("useHideOutside", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("sets aria-hidden on outside siblings and removes it on unmount", () => {
    const targetRef = createRef<HTMLDivElement>();

    const Comp = createComponent(() => {
      useHideOutside({
        targets: targetRef,
        root: container,
      });

      return $div({}, [
        $div({ ref: targetRef, id: "modal" }, "Modal content"),
        $div({ id: "sibling1" }, "Sibling 1"),
        $div({ id: "sibling2" }, "Sibling 2"),
      ]);
    });

    const unmount = mount(Comp, container);

    const modal = container.querySelector("#modal")!;
    const sibling1 = container.querySelector("#sibling1")!;
    const sibling2 = container.querySelector("#sibling2")!;

    expect(modal.getAttribute("aria-hidden")).toBeNull();
    expect(sibling1.getAttribute("aria-hidden")).toBe("true");
    expect(sibling2.getAttribute("aria-hidden")).toBe("true");

    unmount();

    expect(sibling1.getAttribute("aria-hidden")).toBeNull();
    expect(sibling2.getAttribute("aria-hidden")).toBeNull();
  });

  it("respects isDisabled prop", () => {
    const targetRef = createRef<HTMLDivElement>();
    const isDisabled = createValue(true);

    const Comp = createComponent(() => {
      useHideOutside({
        targets: targetRef,
        root: container,
        isDisabled,
      });

      return $div({}, [$div({ ref: targetRef, id: "target" }), $div({ id: "outside" })]);
    });

    const unmount = mount(Comp, container);

    const outside = container.querySelector("#outside")!;
    expect(outside.getAttribute("aria-hidden")).toBeNull();

    // Enable
    isDisabled(false);
    expect(outside.getAttribute("aria-hidden")).toBe("true");

    // Disable
    isDisabled(true);
    expect(outside.getAttribute("aria-hidden")).toBeNull();

    unmount();
  });
});
