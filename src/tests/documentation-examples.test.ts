import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $div, bindInput, Safe, Seidr, withStorage } from "../index.core";
import { inServer, renderToString } from "../ssr";
import { enableClientMode, enableSSRMode } from "../test-setup";

// Mocks
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("Documentation Verification", () => {
  beforeEach(() => {
    enableClientMode();
  });

  describe("withStorage Error Handling", () => {
    beforeEach(() => {
      enableClientMode();
      localStorageMock.clear();
      vi.clearAllMocks();
    });

    it("should handle corrupted JSON gracefully", () => {
      localStorageMock.getItem.mockReturnValue("corrupted json");
      const state = new Seidr({ val: 1 });

      // Should throw error for corrupted JSON
      expect(() => {
        withStorage("test-key", state);
      }).toThrow("Failed to read from storage");

      // Should keep default value (error thrown before value changes)
      expect(state.value).toEqual({ val: 1 });
    });

    it("should handle corrupted JSON with Safe component", () => {
      localStorageMock.getItem.mockReturnValue("corrupted json");
      const state = new Seidr({ val: 1 });

      // Wrap with Safe to handle the error
      const safeComp = Safe(
        () => {
          withStorage("test-key", state);
          return $div({ textContent: "Success" });
        },
        (error) => $div({ textContent: `Error: ${error.message}` }),
      );

      // Should render fallback instead of throwing
      const element = safeComp.element as HTMLDivElement;
      expect(element.textContent).toContain("Error");
    });
  });

  describe("SSR Async", () => {
    let cleanup: () => void;

    beforeEach(() => {
      cleanup = enableSSRMode();
    });

    afterEach(() => {
      cleanup();
    });

    it("renderToString awaits inServer promises", async () => {
      const externalState = new Seidr<string>("initial");

      const App = () => {
        inServer(async () => {
          await new Promise((r) => setTimeout(r, 10)); // simulate fetch
          externalState.value = "fetched";
        });
        return $div({ textContent: externalState });
      };

      const { html } = await renderToString(App);
      // In SSR mode, html is string
      expect(html).toContain("fetched");
    });
  });

  describe("bindInput", () => {
    it("updates observable on input", () => {
      const state = new Seidr("initial");
      const binding = bindInput(state);

      expect(binding.value).toBe(state);

      // Simulate input
      const input = { value: "updated" };
      binding.oninput({ target: input } as any);

      expect(state.value).toBe("updated");
    });
  });
});
