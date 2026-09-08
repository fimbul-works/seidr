import { beforeEach, describe, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { DATA_KEY_ROUTER } from "./constants.js";
import { initRouter } from "./init-router.js";
import type { RouterState } from "./types.js";

describe("initRouter()", () => {
  beforeEach(() => {
    getAppState().deleteData(DATA_KEY_ROUTER);
  });

  it("should initialize default state in browser", () => {
    // Note: window.location.href is available in JSDOM
    initRouter();

    expect(getAppState().hasData(DATA_KEY_ROUTER)).toBe(true);
    const routerState = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    expect(routerState.url().href).toMatch(/http:\/\/localhost|https:\/\/fimbul\.works/);
    expect(routerState.tree).toBeInstanceOf(Map);
    expect(routerState.popstateListeners).toBeInstanceOf(Set);
  });

  it("should initialize with custom URL", () => {
    initRouter("http://example.com/test?a=1");

    const routerState = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;
    expect(routerState.url().href).toBe("http://example.com/test?a=1");
    expect(routerState.url().pathname).toBe("/test");
    expect(routerState.url().searchParams.get("a")).toBe("1");
  });

  it("should handle relative URL with base", () => {
    initRouter("/foo", "http://base.com");

    const routerState = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;
    expect(routerState.url().href).toBe("http://base.com/foo");
  });
});
