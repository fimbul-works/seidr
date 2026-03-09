import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAppState } from "../../app-state/app-state";
import { component } from "../../component/component";
import { USE_HASH_DATA_KEY, useHash } from "./use-hash";

describe("useHash", () => {
  let appState: ReturnType<typeof getAppState>;

  beforeEach(() => {
    vi.doMock("../../util/environment/server", () => ({
      isServer: () => false,
    }));
    appState = getAppState();
    appState.data.clear();
    window.location.hash = "";
  });

  afterEach(() => {
    vi.doUnmock("../../util/environment/server");
    appState.data.clear();
    vi.restoreAllMocks();
  });

  it("should create a shared hash seidr on first use", () => {
    let hash1: any;
    let hash2: any;

    const Comp1 = component(() => {
      hash1 = useHash();
      return null;
    });
    Comp1();

    const Comp2 = component(() => {
      hash2 = useHash();
      return null;
    });
    Comp2();

    expect(hash1).not.toBe(hash2); // derived seidrs are unique
    expect(hash1.value).toBe("");
    expect(hash2.value).toBe("");

    // They should share the same parent though
    const parent1 = hash1.parents[0];
    const parent2 = hash2.parents[0];
    expect(parent1).toBeDefined();
    expect(parent1).toBe(parent2);

    // Verify app state
    expect(appState.hasData(USE_HASH_DATA_KEY)).toBe(true);
  });

  it("should update all subscribers when hash changes", () => {
    let hash1: any;
    let hash2: any;

    const Comp1 = component(() => {
      hash1 = useHash();
      return null;
    });
    Comp1();

    const Comp2 = component(() => {
      hash2 = useHash();
      return null;
    });
    Comp2();

    // simulate hash change event
    window.location.hash = "#test";
    const popstateEvent = new PopStateEvent("popstate");
    window.dispatchEvent(popstateEvent);

    expect(hash1.value).toBe("#test");
    expect(hash2.value).toBe("#test");
  });

  it("should cleanup correctly when the root component unmounts", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    let hash1: any;
    let hash2: any;

    const Child1 = component(() => {
      hash1 = useHash();
      return null;
    });

    const Child2 = component(() => {
      hash2 = useHash();
      return null;
    });

    const RootComponent = component(() => {
      Child1();
      Child2();
      return null;
    });

    const root = RootComponent();

    expect(addEventListenerSpy).toHaveBeenCalledWith("hashchange", expect.any(Function));
    expect(appState.hasData(USE_HASH_DATA_KEY)).toBe(true);

    // Unmount root component
    root.unmount();

    // Cleanup should occur based on root component unmount
    expect(removeEventListenerSpy).toHaveBeenCalledWith("hashchange", expect.any(Function));
    expect(appState.hasData(USE_HASH_DATA_KEY)).toBe(false);

    // Verify derived seidrs are cleaned up
    expect(hash1.observerCount()).toBe(0);
    expect(hash2.observerCount()).toBe(0);
  });
});
