import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setAppStateProvider } from "../../app-state/app-state.js";
import { createComponent } from "../../component/index.js";
import { $ } from "../../element/index.js";
import { $div, $main, $nav } from "../../elements/index.js";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import { createValue, mergeValues } from "../../observable/value.js";
import { enableClientMode, enableSSRMode, getAppState } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { isComment } from "../../dom/type-guards.js";
import { renderToString } from "../render-to-string.js";
import { setSSRScope } from "../ssr-scope.js";
import type { HydrationData } from "../types.js";
import { clearHydrationData, hydrate, initHydrationData, isHydrating } from "./index.js";

describe("Hydration", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    cleanupClientMode = enableClientMode();
    setAppStateProvider(getAppState);
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    cleanupClientMode?.();
    setSSRScope(undefined);
  });

  it("should track hydration state", () => {
    expect(isHydrating()).toBe(false);

    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { "0-0": 42 } },
      components: {},
    };

    initHydrationData(data);
    expect(isHydrating()).toBe(true);

    clearHydrationData();
    expect(isHydrating()).toBe(false);
  });

  it("should clear registry when setting new context", () => {
    const data1: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { a: "first" } },
      components: {},
    };

    initHydrationData(data1);

    const _v1 = createValue(0, { id: "a" });
    const _v2 = createValue(0, { id: "b" });

    const data2: HydrationData = {
      ctxID: 1,
      data: { [DATA_KEY_STATE]: { c: "second" } },
      components: {},
    };

    initHydrationData(data2);

    const v3 = createValue(0, { id: "c" });
    expect(v3()).toBe("second");
  });

  it("should register Value instances in creation order", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { "0": 100, "1": 200 } },
      components: {},
    };

    initHydrationData(data);

    const v1 = createValue(0);
    const v2 = createValue(0);
    const v3 = createValue(0);

    expect(v1()).toBe(100);
    expect(v2()).toBe(200);
    expect(v3()).toBe(0);
  });

  it("should only hydrate root observables", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: { "0": "root" } },
      components: {},
    };

    initHydrationData(data);

    const root = createValue("");
    const derived = root.as((s) => s.toUpperCase());

    expect(root()).toBe("root");
    expect(derived()).toBe("ROOT");
  });

  it("should work with merged observables", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: {
        [DATA_KEY_STATE]: {
          "0": "John",
          "1": "Doe",
        },
      },
      components: {},
    };

    initHydrationData(data);

    const firstName = createValue("");
    const lastName = createValue("");
    const fullName = mergeValues(() => `${firstName()} ${lastName()}`);

    expect(firstName()).toBe("John");
    expect(lastName()).toBe("Doe");
    expect(fullName()).toBe("John Doe");
  });

  it("should not register when not hydrating", () => {
    const v = createValue(42);
    expect(v()).toBe(42);
  });

  it("should hydrate complete component with bindings", () => {
    initHydrationData({
      ctxID: 0,
      data: {
        [DATA_KEY_STATE]: {
          "0": "hydrated-name",
          "2": true,
        },
      },
      components: {},
    });

    const name = createValue("");
    const derived = name.as((s) => s.toUpperCase());
    const disabled = createValue(false);

    const button = $("button", {
      textContent: derived,
      disabled,
    }) as HTMLButtonElement;

    expect(name()).toBe("hydrated-name");
    expect(disabled()).toBe(true);
    expect(button.textContent).toBe("HYDRATED-NAME");
    expect(button.disabled).toBe(true);
  });

  it("should restore observable values during hydration", async () => {
    const TestComponent = createComponent(() => {
      const count = createValue(0, { id: "test-count" });
      return $div(
        null,
        count.as((n) => `Count: ${n}`),
      );
    }, "TestComponent");

    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(TestComponent);
    cleanupSSR();

    // Modify server captured state
    hydrationData.data[DATA_KEY_STATE]!["test-count"] = 42;

    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    unmount = hydrate(TestComponent, container, hydrationData);

    expect(container.textContent).toContain("Count: 42");
  });

  it("should support hydrating raw function components", async () => {
    const RawComponent = () => $div({ textContent: "raw function" });

    const cleanupSSR = enableSSRMode();
    const { html, hydrationData } = await renderToString(RawComponent);
    cleanupSSR();

    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    unmount = hydrate(RawComponent, container, hydrationData);

    expect(container.textContent).toBe("raw function");
  });

  it("should hydrate root component returning an array", async () => {
    const Nav = createComponent(() => {
      return $nav({ textContent: "Navigation" });
    }, "Nav");

    const Main = createComponent(() => {
      return $main({ textContent: "Main Content" });
    }, "Main");

    const App = createComponent(() => {
      return [Nav(), Main()];
    }, "App");

    // 1. SSR Pass
    const cleanupSSRMode = enableSSRMode();
    const { html, hydrationData } = await renderToString(App);
    cleanupSSRMode();

    expect(html).toContain("Navigation");
    expect(html).toContain("Main Content");
    expect(html).toContain("<!--$App");

    // 2. Client Setup
    cleanupClientMode = enableClientMode();
    container.innerHTML = html;

    // 3. Hydrate
    unmount = hydrate(App, container, hydrationData);

    expect(container.textContent).toContain("Navigation");
    expect(container.textContent).toContain("Main Content");

    const childNodes = Array.from(container.childNodes);
    const comments = childNodes.filter((n) => isComment(n));

    // We should have exactly 2 markers for App
    expect(comments.length).toBe(2);
    expect(comments[0].textContent).toContain("$App");
    expect(comments[1].textContent).toContain("/App");

    expect(childNodes[0]).toBe(comments[0]);
    expect(childNodes[childNodes.length - 1]).toBe(comments[1]);

    const nav = container.querySelector("nav");
    const main = container.querySelector("main");
    expect(nav).not.toBeNull();
    expect(main).not.toBeNull();
  });

  it("should throw error if hydration is already active", () => {
    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: {} },
      components: {},
    };

    initHydrationData(data);
    expect(() => hydrate(() => $div("test"), container, data)).toThrow(/Hydration is already active/);
  });

  it("should throw error if hydration data is invalid", () => {
    expect(() => hydrate(() => $div("test"), container, null as any)).toThrow(/Invalid hydration data/);
    expect(() => hydrate(() => $div("test"), container, {} as any)).toThrow(/Invalid hydration data/);
  });

  it("should clear hydration state even if rendering throws", () => {
    const FailingComponent = () => {
      throw new Error("Render error");
    };

    const data: HydrationData = {
      ctxID: 0,
      data: { [DATA_KEY_STATE]: {} },
      components: {},
    };

    expect(() => hydrate(FailingComponent, container, data)).toThrow("Render error");
    expect(isHydrating()).toBe(false);
  });
});
