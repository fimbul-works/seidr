import { afterEach } from "vitest";
import { type DOMFactory, getDOMFactory, setInternalDOMFactory } from "./dom-factory";
import { getBrowserDOMFactory } from "./dom-factory/dom-factory.browser";
import { getSSRDOMFactory } from "./dom-factory/dom-factory.node";
import { type RenderContext, setInternalContext } from "./render-context";
import type { CleanupFunction } from "./types";

// Initialize browser render context for all tests
// Set up a simple browser render context that returns a valid context object
export const browserContext: RenderContext = {
  ctxID: 0,
  idCounter: 0,
  seidrIdCounter: 0,
  randomCounter: 0,
  currentPath: "/",
};

/**
 * Set the render context ID for tests.
 */
export function setRenderContextID(id: number): void {
  browserContext.ctxID = id;
}

/**
 * Robust getRenderContext for tests.
 * Prefers AsyncLocalStorage if available (SSR), falls back to browserContext.
 */
function testGetRenderContext(): RenderContext {
  // This is essentially what render-context.node.ts does but with a fallback
  // We try to get it from the contract-assigned function first if it's set to something else,
  // but here we just want a reliable fallback.
  return (global as any).__SEIDR_CONTEXT_STORE__?.getStore() || browserContext;
}

setInternalContext(testGetRenderContext);
setInternalDOMFactory(typeof window === "undefined" ? getSSRDOMFactory : getBrowserDOMFactory);

afterEach(() => {
  // Reset browser context counters for next test
  browserContext.idCounter = 0;
  browserContext.seidrIdCounter = 0;
  browserContext.randomCounter = 0;
  browserContext.randomState = undefined;
  browserContext.currentPath = "/";

  // Clean up DOM after each test
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

// Mock DOM environment for testing
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "test",
  },
  writable: true,
});

interface TestEnvironmentState {
  seidrSSR?: string;
  vitest?: boolean;
  window: any;
  getDOMFactory?: () => DOMFactory;
}

export function enableSSRMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
    getDOMFactory: getDOMFactory,
  };
  process.env.SEIDR_TEST_SSR = "true";
  setInternalDOMFactory(getSSRDOMFactory);
  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    setInternalContext(testGetRenderContext);
    if (currentState.getDOMFactory !== undefined) setInternalDOMFactory(currentState.getDOMFactory);
  };
}

export function enableClientMode(): CleanupFunction {
  const currentState: TestEnvironmentState = {
    seidrSSR: process.env.SEIDR_TEST_SSR,
    vitest: (process.env as any).VITEST,
    window: (global as any).window,
    getDOMFactory: getDOMFactory,
  };
  delete process.env.SEIDR_TEST_SSR;
  delete (process.env as any).VITEST;

  if (typeof window === "undefined") {
    (global as any).window = currentState.window || {};
  }

  setInternalContext(testGetRenderContext);
  setInternalDOMFactory(getBrowserDOMFactory);

  return () => {
    if (currentState.seidrSSR !== undefined) process.env.SEIDR_TEST_SSR = currentState.seidrSSR;
    else delete process.env.SEIDR_TEST_SSR;
    if (currentState.vitest !== undefined) (process.env as any).VITEST = currentState.vitest;
    else delete (process.env as any).VITEST;
    if (currentState.window !== undefined) (global as any).window = currentState.window;
    if (currentState.getDOMFactory !== undefined) setInternalDOMFactory(currentState.getDOMFactory);
  };
}
