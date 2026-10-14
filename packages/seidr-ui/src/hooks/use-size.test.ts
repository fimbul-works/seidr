import { createComponent, createRef, mount, SeidrError } from "@fimbul-works/seidr";
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

  it("returns zero dimensions when the ref element is null", () => {
    const ref = createRef<HTMLElement>();
    const size = useSize(ref);

    expect(size.width()).toBe(0);
    expect(size.height()).toBe(0);
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it("provides the size synchronously from offset dimensions when element is assigned", () => {
    mockOffsetWidth = 120;
    mockOffsetHeight = 40;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);

    const element = document.createElement("div");
    ref(element);

    // Available immediately, before any observer callback fires
    expect(size.width()).toBe(120);
    expect(size.height()).toBe(40);
  });

  it("provides the size synchronously from offset dimensions on component mount", () => {
    mockOffsetWidth = 120;
    mockOffsetHeight = 40;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const Comp = createComponent(() => {
      const output = size.width.as((w) => `${w}x${size.height()}`);
      return $div({}, [$div({ ref, id: "box" }), $div({ id: "output" }, output)]);
    });

    const unmount = mount(Comp, container);

    expect(container.querySelector("#output")?.textContent).toBe("120x40");
    expect(size.width()).toBe(120);
    expect(size.height()).toBe(40);

    unmount();
    container.remove();
  });

  it("observes the element using the `border-box` box model", () => {
    const ref = createRef<HTMLDivElement>();
    useSize(ref);

    const element = document.createElement("div");
    ref(element);

    const observer = MockResizeObserver.latest;
    expect(observer.observed.has(element)).toBe(true);
    expect(observer.observed.get(element)).toEqual({ box: "border-box" });
  });

  it("updates the size from `borderBoxSize` reported as an array", async () => {
    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 200, blockSize: 100 }] }]);

    await vi.waitFor(() => {
      expect(size.width()).toBe(200);
      expect(size.height()).toBe(100);
    });
  });

  it("updates the size from `borderBoxSize` reported as a plain object", async () => {
    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 320, blockSize: 240 } }]);

    await vi.waitFor(() => {
      expect(size.width()).toBe(320);
      expect(size.height()).toBe(240);
    });
  });

  it("falls back to offset dimensions when `borderBoxSize` is unavailable", async () => {
    mockOffsetWidth = 55;
    mockOffsetHeight = 66;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    // No `borderBoxSize` key; fallback reads `offsetWidth`/`offsetHeight`.
    MockResizeObserver.latest.emit([{}]);

    await vi.waitFor(() => {
      expect(size.width()).toBe(55);
      expect(size.height()).toBe(66);
    });
  });

  it("ignores empty or non-array observer payloads", async () => {
    mockOffsetWidth = 10;
    mockOffsetHeight = 20;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    expect(size.width()).toBe(10);
    expect(size.height()).toBe(20);

    MockResizeObserver.latest.emit([]);
    MockResizeObserver.latest.callback(
      undefined as unknown as ResizeObserverEntry[],
      MockResizeObserver.latest as unknown as ResizeObserver,
    );

    expect(size.width()).toBe(10);
    expect(size.height()).toBe(20);
  });

  it("resets the size to 0 when the element becomes `null`", () => {
    mockOffsetWidth = 80;
    mockOffsetHeight = 30;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    expect(size.width()).toBe(80);
    expect(size.height()).toBe(30);

    ref(null);
    expect(size.width()).toBe(0);
    expect(size.height()).toBe(0);
  });

  it("resets the size to 0 and cleans up when a component unmounts", () => {
    mockOffsetWidth = 80;
    mockOffsetHeight = 30;

    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);

    const container = document.createElement("div");
    document.body.appendChild(container);

    const Comp = createComponent(() => $div({ ref }));
    const unmount = mount(Comp, container);

    expect(size.width()).toBe(80);
    expect(size.height()).toBe(30);

    unmount();
    expect(size.width()).toBe(0);
    expect(size.height()).toBe(0);
    container.remove();
  });

  it("switches observation seamlessly when ref changes to another element", () => {
    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);

    mockOffsetWidth = 50;
    mockOffsetHeight = 50;
    const el1 = document.createElement("div");
    ref(el1);

    expect(size.width()).toBe(50);
    expect(size.height()).toBe(50);
    const observer1 = MockResizeObserver.latest;
    expect(observer1.observed.has(el1)).toBe(true);

    mockOffsetWidth = 100;
    mockOffsetHeight = 100;
    const el2 = document.createElement("div");
    ref(el2);

    // Old element observer is disconnected
    expect(observer1.observed.has(el1)).toBe(false);
    // Size immediately matches the new element
    expect(size.width()).toBe(100);
    expect(size.height()).toBe(100);
    // New observer observing el2
    const observer2 = MockResizeObserver.latest;
    expect(observer2.observed.has(el2)).toBe(true);
  });

  it("does not notify subscribers when size dimensions are unchanged (isEqual deduplication)", async () => {
    const ref = createRef<HTMLDivElement>();
    const size = useSize(ref);
    const element = document.createElement("div");
    ref(element);

    const listener = vi.fn();
    size.width.watch(listener);

    // Emit same size as current (0x0)
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 0, blockSize: 0 }] }]);
    expect(listener).not.toHaveBeenCalled();

    // Emit new size
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 100, blockSize: 200 }] }]);
    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
    expect(listener).toHaveBeenCalledWith(100, 0);

    // Emit duplicate size
    MockResizeObserver.latest.emit([{ borderBoxSize: [{ inlineSize: 100, blockSize: 200 }] }]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe("direct synchronous updates and accessors", () => {
    it("updates size immediately on observer emission without rAF delay", () => {
      mockOffsetWidth = 10;
      mockOffsetHeight = 10;

      const ref = createRef<HTMLDivElement>();
      const size = useSize(ref);
      const element = document.createElement("div");
      ref(element);

      expect(size.width()).toBe(10);
      expect(size.height()).toBe(10);

      MockResizeObserver.latest.emit([{ borderBoxSize: { inlineSize: 300, blockSize: 300 } }]);

      // Synchronously updated
      expect(size.width()).toBe(300);
      expect(size.height()).toBe(300);
    });

    it("un-observes and resets on component unmount", () => {
      const ref = createRef<HTMLDivElement>();
      const size = useSize(ref);

      const container = document.createElement("div");
      document.body.appendChild(container);
      const Comp = createComponent(() => $div({ ref }));
      const unmount = mount(Comp, container);

      const observer = MockResizeObserver.latest;
      expect(observer.observed.size).toBe(1);

      unmount();

      expect(observer.observed.size).toBe(0);
      expect(size.width()).toBe(0);
      expect(size.height()).toBe(0);
      container.remove();
    });
  });
});
