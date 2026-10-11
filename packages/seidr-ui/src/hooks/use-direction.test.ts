import { createComponent, createValue, mount, SeidrError } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Direction, getDirection, resetDirection, useDirection } from "./use-direction.js";

describe("Direction constants and identifiers", () => {
  it("exports correct Direction constants", () => {
    expect(Direction.LTR).toBe("ltr");
    expect(Direction.RTL).toBe("rtl");
  });
});

describe("useDirection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    resetDirection();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    resetDirection();
  });

  it("defaults to the global direction when called with no argument", () => {
    const dir = useDirection();
    expect(dir()).toBe("ltr");
  });

  it("returns global direction when called with nullish value", () => {
    const dirNull = useDirection(null);
    expect(dirNull()).toBe("ltr");

    const dirUndef = useDirection(undefined);
    expect(dirUndef()).toBe("ltr");
  });

  it("pushes to stack and returns the direction when called with a valid value", () => {
    const dir = useDirection(Direction.RTL);
    expect(dir()).toBe("rtl");
    expect(getDirection()).toBe("rtl");
  });

  it("throws SeidrError for invalid direction value", () => {
    expect(() => useDirection("invalid" as any)).toThrow(SeidrError);
  });

  it("automatically pops from stack when calling component unmounts", () => {
    expect(getDirection()).toBe("ltr");

    const Modal = createComponent(() => {
      useDirection(Direction.RTL);
      return $div({}, "Modal Content");
    });

    const unmount = mount(Modal, container);
    expect(getDirection()).toBe("rtl");

    unmount();
    expect(getDirection()).toBe("ltr");
  });

  it("propagates direction to child components and restores on unmount", () => {
    let childObservedDir = "";

    const Child = createComponent(() => {
      const dir = useDirection();
      childObservedDir = dir();
      return $div({ dir }, "Child");
    });

    const Parent = createComponent(() => {
      useDirection(Direction.RTL);
      return Child();
    });

    const unmount = mount(Parent, container);
    expect(childObservedDir).toBe("rtl");
    expect(getDirection()).toBe("rtl");

    unmount();
    expect(getDirection()).toBe("ltr");
  });

  it("supports reactive Value for direction and restores on unmount", () => {
    const dynamicDir = createValue<Direction>(Direction.LTR);

    const Modal = createComponent(() => {
      useDirection(dynamicDir);
      return $div({}, "Modal");
    });

    const unmount = mount(Modal, container);
    expect(getDirection()).toBe("ltr");

    dynamicDir(Direction.RTL);
    expect(getDirection()).toBe("rtl");

    dynamicDir(Direction.LTR);
    expect(getDirection()).toBe("ltr");

    unmount();
    expect(getDirection()).toBe("ltr");
  });

  it("handles nested component overrides and restores stack on sequential unmounts", () => {
    expect(getDirection()).toBe("ltr");

    const Inner = createComponent(() => {
      useDirection(Direction.LTR);
      return $div({}, "Inner");
    });

    const Outer = createComponent(() => {
      useDirection(Direction.RTL);
      return Inner();
    });

    const unmount = mount(Outer, container);
    // Inner was mounted inside Outer, so top of stack is "ltr"
    expect(getDirection()).toBe("ltr");

    unmount();
    expect(getDirection()).toBe("ltr");
  });
});

describeDualMode("Direction SSR and Client safety", () => {
  beforeEach(() => {
    resetDirection();
  });

  afterEach(() => {
    resetDirection();
  });

  it("executes safely in SSR without throwing", () => {
    expect(getDirection()).toBe("ltr");

    const App = createComponent(() => {
      const dir = useDirection(Direction.RTL);
      return $div({ dir });
    });

    expect(() => {
      const comp = App();
      comp.mount();
      comp.unmount();
    }).not.toThrow();
  });
});
