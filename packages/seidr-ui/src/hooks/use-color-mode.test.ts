import { beforeEach, describe, expect, it } from "vitest";
import { useColorMode } from "./use-color-mode.js";

describe("useColorMode", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("initializes with system or provided initialValue", () => {
    const { mode, resolvedMode } = useColorMode({ initialValue: "light", storageKey: null });

    expect(mode()).toBe("light");
    expect(resolvedMode()).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("updates mode and applies class to documentElement", () => {
    const { mode, resolvedMode } = useColorMode({ initialValue: "light", storageKey: null });

    mode("dark");
    expect(mode()).toBe("dark");
    expect(resolvedMode()).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);

    mode("light");
    expect(mode()).toBe("light");
    expect(resolvedMode()).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("supports custom attribute", () => {
    const { mode } = useColorMode({
      initialValue: "dark",
      attribute: "data-theme",
      storageKey: null,
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    mode("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists to localStorage when storageKey is set", () => {
    const { mode } = useColorMode({
      initialValue: "light",
      storageKey: "test-color-mode",
    });

    mode("dark");
    expect(window.localStorage.getItem("test-color-mode")).toBe("dark");
  });
});
