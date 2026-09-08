import { beforeEach, expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import { DATA_KEY_ROUTER } from "./constants.js";
import { history } from "./history.js";
import { initRouter } from "./init-router.js";
import type { RouterState } from "./types.js";

describeDualMode("history()", ({ isSSR }) => {
  beforeEach(() => {
    // Reset AppState for each test
    getAppState().deleteData(DATA_KEY_ROUTER);
  });

  it("should throw if router is not initialized", () => {
    expect(() => history()).toThrow("Router is not initialized");
  });

  it("should update URL observable on push", () => {
    initRouter("http://localhost/");
    const h = history();
    const state = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    h.push("/about");

    expect(state.url().pathname).toBe("/about");
    expect(state.url().href).toBe("http://localhost/about");
  });

  it("should update URL observable on replace", () => {
    initRouter("http://localhost/");
    const h = history();
    const state = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    h.replace("/contact");

    expect(state.url().pathname).toBe("/contact");
    expect(state.url().href).toBe("http://localhost/contact");
  });

  it("should handle relative paths in push/replace", () => {
    initRouter("http://localhost/docs/");
    const h = history();
    const state = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    h.push("api");
    expect(state.url().pathname).toBe("/docs/api");

    h.replace("guide");
    expect(state.url().pathname).toBe("/docs/guide");
  });

  it("should maintain internal history for go()", () => {
    initRouter("http://localhost/");
    const h = history();
    const state = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    h.push("/1");
    h.push("/2");
    h.push("/3");

    expect(state.url().pathname).toBe("/3");

    h.go(-1);
    expect(state.url().pathname).toBe("/2");

    h.go(-1);
    expect(state.url().pathname).toBe("/1");

    h.go(2);
    expect(state.url().pathname).toBe("/3");
  });

  it("should respect history boundaries in go()", () => {
    initRouter("http://localhost/");
    const h = history();
    const state = getAppState().getData<RouterState>(DATA_KEY_ROUTER)!;

    h.push("/1");

    h.go(-10); // Before start
    expect(state.url().pathname).toBe("/");

    h.go(10); // After end
    expect(state.url().pathname).toBe("/1");
  });

  if (!isSSR) {
    it("should call window.history in client mode", () => {
      const pushSpy = vi.spyOn(window.history, "pushState");
      const replaceSpy = vi.spyOn(window.history, "replaceState");
      const goSpy = vi.spyOn(window.history, "go");

      initRouter("http://localhost/");
      const h = history();

      h.push("/next");
      expect(pushSpy).toHaveBeenCalledWith({}, "", "/next");

      h.replace("/current");
      expect(replaceSpy).toHaveBeenCalledWith({}, "", "/current");

      h.go(-1);
      expect(goSpy).toHaveBeenCalledWith(-1);

      pushSpy.mockRestore();
      replaceSpy.mockRestore();
      goSpy.mockRestore();
    });
  }
});
