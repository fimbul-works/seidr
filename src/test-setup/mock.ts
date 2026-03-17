import { beforeEach, afterEach, vi } from "vitest";
import * as onMountModule from "../component/on-mount";
import * as onUnmountModule from "../component/on-unmount";

/**
 * Mocks the component lifecycle hooks for tests that need to run in SSR mode
 * but don't actually need scope tracking.
 */
export function mockComponentScope() {
  let onMountSpy: any;
  let onUnmountSpy: any;

  beforeEach(() => {
    onMountSpy = vi.spyOn(onMountModule, "onMount").mockReturnValue({
      onMount: () => {},
    } as any);
    onUnmountSpy = vi.spyOn(onUnmountModule, "onUnmount").mockReturnValue({
      onMount: () => {},
    } as any);
  });

  afterEach(() => {
    onMountSpy?.mockRestore();
    onUnmountSpy?.mockRestore();
  });
}

/**
 * Mocks the window.navigator object.
 */
export function mockNavigator(userAgent = "test") {
  if (typeof window === "undefined") return;
  
  Object.defineProperty(window, "navigator", {
    value: {
      userAgent,
    },
    writable: true,
    configurable: true,
  });
}
