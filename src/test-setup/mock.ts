import { afterEach, beforeEach, vi } from "vitest";
import { getAppState } from "../app-state/app-state";
import type { Component } from "../component/types";
import { DATA_KEY_COMPONENT_SCOPE, TYPE_COMPONENT, TYPE_PROP } from "../constants";

/**
 * Mocks the component lifecycle hooks for tests that need to run in SSR mode
 * but don't actually need scope tracking.
 */
export function mockComponentScope() {
  const cleanups: (() => void)[] = [];

  const mockComponent = {
    [TYPE_PROP]: TYPE_COMPONENT,
    id: "mock-component",
    numericId: 0,
    nextChildId: vi.fn(() => 0),
    isMounted: true,
    parent: null,
    parentNode: null,
    element: null,
    children: new Map(),
    startMarker: null,
    endMarker: null,
    createdIndex: [],
    childCreatedIndex: new Map(),
    onMount: vi.fn((fn) => fn(document.body)),
    onAttached: vi.fn((fn) => fn()),
    onUnmount: vi.fn((fn) => cleanups.push(fn)),
    mount: vi.fn(),
    unmount: vi.fn(() => mockComponent.cleanup()),
    attached: vi.fn(),
    cleanup: vi.fn(() => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    }),
    addChild: vi.fn((c) => c),
    removeChild: vi.fn(),
    trackChild: vi.fn(),
    untrackChild: vi.fn(),
  } as unknown as Component;

  beforeEach(() => {
    getAppState().setData(DATA_KEY_COMPONENT_SCOPE, mockComponent);
    vi.clearAllMocks();
    cleanups.length = 0;
  });

  afterEach(() => {
    mockComponent.cleanup();
    getAppState().deleteData(DATA_KEY_COMPONENT_SCOPE);
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
