import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describe, expect, it } from "vitest";
import { usePreventScroll } from "./use-prevent-scroll.js";

describe("usePreventScroll", () => {
  it("locks body overflow to hidden when active and restores on unmount", () => {
    document.body.style.overflow = "visible";

    const Comp = createComponent(() => {
      usePreventScroll();
      return document.createElement("div");
    });

    const unmount = mount(Comp, document.body);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("visible");
  });

  it("handles reactive isDisabled value", () => {
    document.body.style.overflow = "auto";
    const isDisabled = createValue(true);

    const Comp = createComponent(() => {
      usePreventScroll({ isDisabled });
      return document.createElement("div");
    });

    const unmount = mount(Comp, document.body);
    expect(document.body.style.overflow).toBe("auto");

    isDisabled(false);
    expect(document.body.style.overflow).toBe("hidden");

    isDisabled(true);
    expect(document.body.style.overflow).toBe("auto");

    unmount();
  });
});

