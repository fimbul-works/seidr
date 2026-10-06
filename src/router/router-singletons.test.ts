import { afterEach, beforeEach, expect, it } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { createComponent } from "../component/create-component.js";
import { mount } from "../dom/mount.js";
import { $div } from "../elements/div.js";
import { isValue } from "../observable/type-guards.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import type { CleanupFunction } from "../types.js";
import { browserRouter } from "./browser-router.js";
import { DATA_KEY_BROWSER_ROUTER } from "./constants.js";
import { initRouter } from "./init-router.js";

describeDualMode("Router Singletons", ({ getDocument }) => {
  const comp = createComponent(() => $div());
  let cleanup: CleanupFunction;

  beforeEach(() => {
    const doc = getDocument();
    const container = doc.createElement("div");
    doc.body.appendChild(container);
    initRouter("/");
    cleanup = mount(comp, container);
  });

  afterEach(() => {
    cleanup();
  });

  it("browserRouter should return the same instance", () => {
    const router1 = browserRouter();
    const router2 = browserRouter();

    expect(router1).toBe(router2);
    expect(getAppState().hasData(DATA_KEY_BROWSER_ROUTER)).toBe(true);
    expect(getAppState().getData(DATA_KEY_BROWSER_ROUTER)).toBe(router1);
  });

  it("router instances should have required properties", () => {
    const router = browserRouter();

    expect(router).toHaveProperty("push");
    expect(router).toHaveProperty("replace");
    expect(router).toHaveProperty("go");
    expect(isValue(router.pathname)).toBe(true);
    expect(isValue(router.searchParams)).toBe(true);
    expect(isValue(router.routeParams)).toBe(true);
  });
});
