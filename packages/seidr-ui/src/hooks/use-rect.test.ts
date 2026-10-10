import { createComponent, mount, SeidrError, useRef } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearObservedElements, useRect } from "./use-rect.js";

function createMockRect(values: { top?: number; left?: number; width?: number; height?: number }): DOMRect {
  const top = values.top ?? 0;
  const left = values.left ?? 0;
  const width = values.width ?? 0;
  const height = values.height ?? 0;

  return new DOMRect(left, top, width, height);
}

function setElementRect(
  element: HTMLElement,
  values: {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
  },
) {
  const rect = createMockRect(values);
  element.getBoundingClientRect = () => rect;
  return rect;
}

describe("useRect", () => {
  beforeEach(() => {
    clearObservedElements();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearObservedElements();
    vi.restoreAllMocks();
  });

  it("throws SeidrError when the argument is not a valid Ref", () => {
    expect(() => useRect(null as any)).toThrow(SeidrError);
    expect(() => useRect(undefined as any)).toThrow(SeidrError);
    expect(() => useRect({} as any)).toThrow(SeidrError);
    expect(() => useRect(document.createElement("div") as any)).toThrow(SeidrError);
  });

  it("returns null when the ref element is null", () => {
    const ref = useRef<HTMLElement>();
    const rect = useRect(ref);

    expect(rect()).toBeNull();
  });

  it("provides the rect synchronously when element is assigned to ref", () => {
    const element = document.createElement("div");
    setElementRect(element, { top: 10, left: 20, width: 100, height: 50 });

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    ref(element);

    expect(rect()).toEqual(createMockRect({ top: 10, left: 20, width: 100, height: 50 }));
  });

  it("provides the rect synchronously on component mount", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    const Comp = createComponent(() => {
      const el = $div({ ref, id: "target" });
      setElementRect(el, { top: 5, left: 15, width: 200, height: 80 });
      return el;
    });

    const unmount = mount(Comp, container);

    expect(rect()).toEqual(createMockRect({ top: 5, left: 15, width: 200, height: 80 }));

    unmount();
    container.remove();
  });

  it("updates rect on animation frame when element dimensions or position change", async () => {
    const element = document.createElement("div");
    setElementRect(element, { top: 0, left: 0, width: 50, height: 50 });

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    ref(element);
    expect(rect()).toEqual(createMockRect({ top: 0, left: 0, width: 50, height: 50 }));

    // Change dimensions
    setElementRect(element, { top: 10, left: 20, width: 120, height: 80 });

    await vi.waitFor(() => {
      expect(rect()).toEqual(createMockRect({ top: 10, left: 20, width: 120, height: 80 }));
    });
  });

  it("does not notify subscribers when rect dimensions are unchanged (isEqual deduplication)", async () => {
    const element = document.createElement("div");
    setElementRect(element, { top: 10, left: 10, width: 100, height: 100 });

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    ref(element);

    const listener = vi.fn();
    rect.watch(listener);

    // Wait for a few animation frames while rect remains identical
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    expect(listener).not.toHaveBeenCalled();

    // Now change the rect
    setElementRect(element, { top: 10, left: 10, width: 150, height: 100 });

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    expect(rect()).toEqual(createMockRect({ top: 10, left: 10, width: 150, height: 100 }));
  });

  it("resets rect to null and stops observing when ref is set to null", async () => {
    const element = document.createElement("div");
    setElementRect(element, { top: 0, left: 0, width: 60, height: 60 });

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    ref(element);
    expect(rect()).toEqual(createMockRect({ top: 0, left: 0, width: 60, height: 60 }));

    ref(null);
    expect(rect()).toBeNull();

    // Mutating element afterwards should not affect rect()
    setElementRect(element, { top: 100, left: 100, width: 200, height: 200 });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(rect()).toBeNull();
  });

  it("resets rect to null when component unmounts", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    const Comp = createComponent(() => {
      const el = $div({ ref });
      setElementRect(el, { top: 0, left: 0, width: 100, height: 100 });
      return el;
    });

    const unmount = mount(Comp, container);
    expect(rect()).toEqual(createMockRect({ top: 0, left: 0, width: 100, height: 100 }));

    unmount();
    expect(rect()).toBeNull();
    container.remove();
  });

  it("switches observation seamlessly when ref changes to a different element", async () => {
    const el1 = document.createElement("div");
    setElementRect(el1, { top: 10, left: 10, width: 50, height: 50 });

    const el2 = document.createElement("div");
    setElementRect(el2, { top: 20, left: 20, width: 90, height: 90 });

    const ref = useRef<HTMLDivElement>();
    const rect = useRect(ref);

    ref(el1);
    expect(rect()).toEqual(createMockRect({ top: 10, left: 10, width: 50, height: 50 }));

    // Switch to el2
    ref(el2);
    expect(rect()).toEqual(createMockRect({ top: 20, left: 20, width: 90, height: 90 }));

    // Updating el1 should no longer affect rect
    setElementRect(el1, { top: 500, left: 500, width: 500, height: 500 });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(rect()).toEqual(createMockRect({ top: 20, left: 20, width: 90, height: 90 }));

    // Updating el2 should update rect
    setElementRect(el2, { top: 30, left: 30, width: 100, height: 100 });
    await vi.waitFor(() => {
      expect(rect()).toEqual(createMockRect({ top: 30, left: 30, width: 100, height: 100 }));
    });
  });
});
