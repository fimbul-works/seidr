import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state";
import { component } from "../component/component";
import { getCurrentPath } from "./get-current-path";

describe("getCurrentPath", () => {
  let appState: ReturnType<typeof getAppState>;

  beforeEach(() => {
    vi.doMock("../util/environment/server", () => ({
      isServer: () => false,
    }));
    appState = getAppState();
    appState.data.clear();
    window.location.hash = "";
  });

  afterEach(() => {
    vi.doUnmock("../util/environment/server");
    appState.data.clear();
    vi.restoreAllMocks();
  });

  it("should create a shared path seidr on first use", () => {
    let path1: any;
    let path2: any;

    const Comp1 = component(() => {
      path1 = getCurrentPath();
      return null;
    });
    Comp1();

    const Comp2 = component(() => {
      path2 = getCurrentPath();
      return null;
    });
    Comp2();

    expect(path1).toBe(path2); // Should be exactly the same instance
    expect(path1.value).toBe("/");
    expect(path2.value).toBe("/");

    // Verify app state
    expect(appState.hasData("seidr.router.path")).toBe(true);
  });

  it("should update path correctly", () => {
    let pathObj: any;

    const Comp1 = component(() => {
      pathObj = getCurrentPath();
      return null;
    });
    Comp1();

    pathObj.value = "/test";

    expect(getCurrentPath().value).toBe("/test");
  });

  it("should cleanup correctly when the root component unmounts", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    let pathInstance: any;

    const Child1 = component(() => {
      pathInstance = getCurrentPath();
      return null;
    });

    const RootComponent = component(() => {
      Child1();
      return null;
    });

    const root = RootComponent();

    expect(addEventListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
    expect(appState.hasData("seidr.router.path")).toBe(true);

    // Unmount root component
    root.unmount();

    // Cleanup should occur based on root component unmount
    expect(removeEventListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
    expect(appState.hasData("seidr.router.path")).toBe(false);

    // Verify derived seidrs are cleaned up
    expect(pathInstance.observerCount()).toBe(0);
  });
});
