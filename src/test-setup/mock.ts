import { afterEach, beforeEach, vi } from "vitest";
import * as onAttachedModule from "../component/on-attached";
import * as onMountModule from "../component/on-mount";
import * as onUnmountModule from "../component/on-unmount";

/**
 * Mocks the component lifecycle hooks for tests that need to run in SSR mode
 * but don't actually need scope tracking.
 */
export function mockComponentScope() {
  let onMountSpy: ReturnType<typeof vi.spyOn>;
  let onUnmountSpy: ReturnType<typeof vi.spyOn>;
  let onAttachedSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    onMountSpy = vi.spyOn(onMountModule, "onMount").mockReturnValue({
      onMount: () => {},
    } as any);
    onUnmountSpy = vi.spyOn(onUnmountModule, "onUnmount").mockReturnValue({
      onUnmount: () => {},
    } as any);
    onAttachedSpy = vi.spyOn(onAttachedModule, "onAttached").mockReturnValue({
      onAttached: () => {},
    } as any);
  });

  afterEach(() => {
    onMountSpy?.mockRestore();
    onUnmountSpy?.mockRestore();
    onAttachedSpy?.mockRestore();
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
