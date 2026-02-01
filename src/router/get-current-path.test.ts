import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type RenderContext, setInternalContext } from "../render-context";
import { clearHydrationData } from "../ssr/hydration-context";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { clearPathCache, getCurrentPath, resetClientPathState } from "./get-current-path";
import { initRouter } from "./init-router";

describe("getCurrentPath", () => {
  let restoreClientMode: CleanupFunction;

  beforeEach(() => {
    restoreClientMode = enableClientMode();
    clearHydrationData();
    initRouter("/");
  });

  afterEach(() => {
    resetClientPathState();
    restoreClientMode();
    clearHydrationData();
    vi.restoreAllMocks();
  });

  it("should return a Seidr instance with current path", () => {
    const path = getCurrentPath();
    expect(path.value).toBe("/");
  });

  it("should return the same instance on multiple calls on client-side", () => {
    const path1 = getCurrentPath();
    const path2 = getCurrentPath();
    expect(path1).toBe(path2);
  });

  it("should use render context on server-side", () => {
    const mockContext = {
      ctxID: 1,
      idCounter: 0,
      seidrIdCounter: 0,
      currentPath: "/server-path",
    } as RenderContext;

    // const restoreSSRMode = enableSSRMode();
    setInternalContext(() => mockContext);

    // Clear cache to ensure we use our mock context
    clearPathCache(1);

    const path = getCurrentPath();
    expect(path.value).toBe("/server-path");
    // restoreSSRMode();
  });

  it("should isolate paths between different render contexts on server-side", () => {
    const ctx1 = {
      ctxID: 1,
      idCounter: 0,
      seidrIdCounter: 0,
      currentPath: "/path-1",
    } as RenderContext;

    const ctx2 = {
      ctxID: 2,
      idCounter: 0,
      seidrIdCounter: 0,
      currentPath: "/path-2",
    } as RenderContext;

    setInternalContext(() => ctx1);
    const path1 = getCurrentPath();
    expect(path1.value).toBe("/path-1");

    setInternalContext(() => ctx2);
    const path2 = getCurrentPath();
    expect(path2.value).toBe("/path-2");

    expect(path1).not.toBe(path2);
  });
});
