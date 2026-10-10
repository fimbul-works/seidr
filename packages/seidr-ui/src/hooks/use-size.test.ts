import { createComponent, mount, SeidrError, useRef } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useSize } from "./use-size.js";

type BorderBoxSize = { inlineSize: number; blockSize: number };
type Entry = { borderBoxSize?: BorderBoxSize | BorderBoxSize[] | undefined };

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  callback: ResizeObserverCallback;
  observed = new Map<Element, ResizeObserverOptions | undefined>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    this.observed.set(target, options);
  }

  unobserve(target: Element) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
  }

  /** Test-only helper to simulate the browser reporting a resize. */
  emit(entries: Entry[]) {
    this.callback(entries as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }

  static get latest(): MockResizeObserver {
    return MockResizeObserver.instances[MockResizeObserver.instances.length - 1]!;
  }

  static reset() {
    MockResizeObserver.instances = [];
  }
}

/* -------------------------------------------------------------------------------------------------
 * Mock `offsetWidth` / `offsetHeight` (JSDOM returns `0` for both by default)
 * -----------------------------------------------------------------------------------------------*/

const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
let mockOffsetWidth = 0;
let mockOffsetHeight = 0;

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return mockOffsetWidth;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return mockOffsetHeight;
    },
  });
});

afterAll(() => {
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
  }
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
  }
});

describe("useSize", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    MockResizeObserver.reset();
    mockOffsetWidth = 0;
    mockOffsetHeight = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws SeidrError when the argument is not a valid Ref", () => {
    expect(() => useSize(null as any)).toThrow(SeidrError);
    expect(() => useSize(undefined as any)).toThrow(SeidrError);
    expect(() => useSize({} as any)).toThrow(SeidrError);
    expect(() => useSize(document.createElement("div") as any)).toThrow(SeidrError);
  });

  it("returns null when the ref element is null", () => {
    const ref = useRef<HTMLElement>();
    const size = useSize(ref);

    expect(size()).toBeNull();
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it("provides the size synchronously from offset dimensions when element is assigned", () => {
    mockOffsetWidth = 120;
    mockOffsetHeight = 40;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);

    const element = document.createElement("div");
    ref(element);

    // Available immediately, before any observer callback fires
    expect(size()).toEqual({ width: 120, height: 40 });
  });

  it("provides the size synchronously from offset dimensions on component mount", () => {
    mockOffsetWidth = 120;
    mockOffsetHeight = 40;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const Comp = createComponent(() => {
      const output = size.as((s) => (s ? `${s.width}x${s.height}` : "none"));
      return $div({}, [$div({ ref, id: "box" }), $div({ id: "output" }, output)]);
    });

    const unmount = mount(Comp, container);

    expect(container.querySelector("#output")?.textContent).toBe("120x40");
    expect(size()).toEqual({ width: 120, height: 40 });

    unmount();
    container.remove();
  });

  it("observes the element using the `border-box` box model", () => {
    const ref = useRef<HTMLDivElement>();
    useSize(ref);

    const element = document.createElement("div");
    ref(element);

    const observer = MockResizeObserver.latest;
    expect(observer.observed.has(element)).toBe(true);
    expect(observer.observed.get(element)).toEqual({ box: "border-box" });
  });

  it("updates the size from `borderBoxSize` reported as an array", async () => {
    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 200, blockSize: 100 }] }]);

    await vi.waitFor(() => expect(size()).toEqual({ width: 200, height: 100 }));
  });

  it("updates the size from `borderBoxSize` reported as a plain object", async () => {
    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 320, blockSize: 240 } }]);

    await vi.waitFor(() => expect(size()).toEqual({ width: 320, height: 240 }));
  });

  it("falls back to offset dimensions when `borderBoxSize` is unavailable", async () => {
    mockOffsetWidth = 55;
    mockOffsetHeight = 66;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    // No `borderBoxSize` key; fallback reads `offsetWidth`/`offsetHeight`.
    MockResizeObserver.latest.emit([{}]);

    await vi.waitFor(() => expect(size()).toEqual({ width: 55, height: 66 }));
  });

  it("ignores empty or non-array observer payloads", async () => {
    mockOffsetWidth = 10;
    mockOffsetHeight = 20;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    expect(size()).toEqual({ width: 10, height: 20 });

    MockResizeObserver.latest.emit([]);
    MockResizeObserver.latest.callback(
      undefined as unknown as ResizeObserverEntry[],
      MockResizeObserver.latest as unknown as ResizeObserver,
    );

    // Allow scheduled frames to run
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(size()).toEqual({ width: 10, height: 20 });
  });

  it("resets the size to `null` when the element becomes `null`", () => {
    mockOffsetWidth = 80;
    mockOffsetHeight = 30;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    expect(size()).toEqual({ width: 80, height: 30 });

    ref(null);
    expect(size()).toBeNull();
  });

  it("resets the size to `null` and cleans up when a component unmounts", () => {
    mockOffsetWidth = 80;
    mockOffsetHeight = 30;

    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const Comp = createComponent(() => $div({ ref }));
    const unmount = mount(Comp, container);

    expect(size()).toEqual({ width: 80, height: 30 });

    unmount();
    expect(size()).toBeNull();
    container.remove();
  });

  it("switches observation seamlessly when ref changes to another element", () => {
    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);

    mockOffsetWidth = 50;
    mockOffsetHeight = 50;
    const el1 = document.createElement("div");
    ref(el1);

    expect(size()).toEqual({ width: 50, height: 50 });
    const observer1 = MockResizeObserver.latest;
    expect(observer1.observed.has(el1)).toBe(true);

    mockOffsetWidth = 100;
    mockOffsetHeight = 100;
    const el2 = document.createElement("div");
    ref(el2);

    // Old element observer is disconnected
    expect(observer1.observed.has(el1)).toBe(false);
    // Size immediately matches the new element
    expect(size()).toEqual({ width: 100, height: 100 });
    // New observer observing el2
    const observer2 = MockResizeObserver.latest;
    expect(observer2.observed.has(el2)).toBe(true);
  });

  it("does not notify subscribers when size dimensions are unchanged (isEqual deduplication)", async () => {
    const ref = useRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    const listener = vi.fn();
    size.watch(listener);

    // Emit same size as current (0x0)
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 0, blockSize: 0 }] }]);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(listener).not.toHaveBeenCalled();

    // Emit new size
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 100, blockSize: 200 }] }]);
    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
    expect(listener).toHaveBeenCalledWith({ width: 100, height: 200 }, { width: 0, height: 0 });

    // Emit duplicate size
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 100, blockSize: 200 }] }]);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe("requestAnimationFrame batching", () => {
    it("defers observer-driven updates to the next animation frame", async () => {
      mockOffsetWidth = 10;
      mockOffsetHeight = 10;

      const ref = useRef<HTMLDivElement>();
      const size = useSize(ref);
      const element = document.createElement("div");
      ref(element);

      expect(size()).toEqual({ width: 10, height: 10 });

      MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 300, blockSize: 300 } }]);

      // Synchronously, size has not changed yet
      expect(size()).toEqual({ width: 10, height: 10 });
      await vi.waitFor(() => expect(size()).toEqual({ width: 300, height: 300 }));
    });

    it("coalesces rapid observations, cancelling previously scheduled frames", async () => {
      const ref = useRef<HTMLDivElement>();
      const size = useSize(ref);
      const element = document.createElement("div");
      ref(element);

      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

      MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 1, blockSize: 1 } }]);
      MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 2, blockSize: 2 } }]);
      MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 3, blockSize: 3 } }]);

      const scheduledIds = rafSpy.mock.results.map((result) => result.value as number);
      expect(scheduledIds).toHaveLength(3);
      expect(cancelSpy).toHaveBeenCalledWith(scheduledIds[0]);
      expect(cancelSpy).toHaveBeenCalledWith(scheduledIds[1]);

      await vi.waitFor(() => expect(size()).toEqual({ width: 3, height: 3 }));
    });

    it("cancels a pending frame and un-observes on unmount / cleanup", () => {
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

      const ref = useRef<HTMLDivElement>();
      useSize(ref);
      const element = document.createElement("div");
      ref(element);

      const observer = MockResizeObserver.latest;
      observer.emit([{ borderBoxSize: { inlineSize: 500, blockSize: 500 } }]);
      const scheduledId = rafSpy.mock.results.at(-1)!.value as number;

      ref(null);

      expect(cancelSpy).toHaveBeenCalledWith(scheduledId);
      expect(observer.observed.has(element)).toBe(false);
    });

    it("cancels a pending frame and un-observes on component unmount", () => {
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

      const ref = useRef<HTMLDivElement>();
      useSize(ref);

      const container = document.createElement("div");
      document.body.appendChild(container);
      const Comp = createComponent(() => $div({ ref }));
      const unmount = mount(Comp, container);

      const observer = MockResizeObserver.latest;
      observer.emit([{ borderBoxSize: { inlineSize: 500, blockSize: 500 } }]);
      const scheduledId = rafSpy.mock.results.at(-1)!.value as number;

      unmount();

      expect(cancelSpy).toHaveBeenCalledWith(scheduledId);
      expect(observer.observed.size).toBe(0);
      container.remove();
    });

    it("does not warn or error when unmounted before a pending frame runs", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      const ref = useRef<HTMLDivElement>();
      const size = useSize(ref);
      const element = document.createElement("div");
      ref(element);

      const observer = MockResizeObserver.latest;
      observer.emit([{ borderBoxSize: { inlineSize: 999, blockSize: 999 } }]);

      ref(null);

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      expect(consoleError).not.toHaveBeenCalled();
      expect(size()).toBeNull();
    });
  });
});
