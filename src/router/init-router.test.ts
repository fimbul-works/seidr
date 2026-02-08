import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableClientMode } from "../test-setup";
import { getCurrentPath, resetClientPathState } from "./get-current-path";
import { initRouter } from "./init-router";

describe("initRouter", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = enableClientMode();
    resetClientPathState();
    vi.stubGlobal("window", {
      location: { pathname: "/" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should initialize currentPath with provided path", () => {
    initRouter("/about");
    expect(getCurrentPath().value).toBe("/about");
  });

  it("should use window.location.pathname by default", () => {
    vi.stubGlobal("window", {
      location: { pathname: "/contact" },
      addEventListener: vi.fn(),
    });
    initRouter();
    expect(getCurrentPath().value).toBe("/contact");
  });

  it("should add popstate event listener on client-side", () => {
    initRouter("/");
    expect(window.addEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
  });

  it("should return a cleanup function that removes the listener", () => {
    const cleanup = initRouter("/");
    cleanup();
    expect(window.removeEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
  });
});
