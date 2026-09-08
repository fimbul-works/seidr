import { afterEach, beforeEach, vi } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import type { OnAttachedFunction, OnMountedFunction, SeidrComponent } from "../component/types.js";
import { DATA_KEY_COMPONENT_CURSOR, DATA_KEY_COMPONENT_SCOPE, TYPE_COMPONENT, TYPE_PROP } from "../constants.js";
import { DATA_KEY_STATE } from "../observable/constants.js";
import type { CleanupFunction } from "../types.js";

/**
 * Mocks the component lifecycle hooks for tests that need to run in SSR mode
 * but don't actually need scope tracking.
 */
export function mockComponentScope() {
  const cleanups: (() => void)[] = [];

  const onMountedFns: OnMountedFunction[] = [];
  const onAttachedFns: OnAttachedFunction[] = [];
  const onUnmountedFns: CleanupFunction[] = [];

  let valueIdCounter = 0;

  const mockComponent = {
    [TYPE_PROP]: TYPE_COMPONENT,
    id: 1,
    name: "mock-component",
    nodes: [],
    owner: null,
    children: new Set(),
    onMount: vi.fn((fn) => {
      onMountedFns.push(fn);
    }),
    onAttach: vi.fn((fn) => {
      onAttachedFns.push(fn);
    }),
    onUnmount: vi.fn((fn) => {
      cleanups.push(fn);
    }),
    get nextValueId() {
      return valueIdCounter++;
    },
    cleanup: vi.fn(() => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    }),
    unmount: vi.fn(() => mockComponent.cleanup()),
  } as unknown as SeidrComponent & { cleanup: () => void };

  beforeEach(() => {
    valueIdCounter = 0;
    getAppState().setData(DATA_KEY_COMPONENT_SCOPE, mockComponent);
    getAppState().setData(DATA_KEY_COMPONENT_CURSOR, mockComponent);
    getAppState().deleteData(DATA_KEY_STATE);
    vi.clearAllMocks();
    cleanups.length = 0;
    onMountedFns.length = 0;
    onAttachedFns.length = 0;
    onUnmountedFns.length = 0;
  });

  afterEach(() => {
    mockComponent.cleanup();
    getAppState().deleteData(DATA_KEY_COMPONENT_SCOPE);
    getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);
    getAppState().deleteData(DATA_KEY_STATE);
  });

  return mockComponent;
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
