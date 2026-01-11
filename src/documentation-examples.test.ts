import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $div, bindInput, component, Safe, Seidr, withStorage } from "./core";
import { inServer } from "./ssr/env";
import { renderToString } from "./ssr/render-to-string";

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
  describe("withStorage Error Handling", () => {
    beforeEach(() => {
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
          return $div("Success");
        },
        (error) => $div({ textContent: `Error: ${error.message}` }),
      );

      // Should render fallback instead of throwing
      const element = safeComp.element as HTMLDivElement;
      expect(element.textContent).toContain("Error");
    });
  });

  describe("Safe Component", () => {
    it("catches synchronous errors", () => {
      const errorComp = Safe(
        () => {
          throw new Error("Sync Error");
        },
        (err) => $div({ textContent: err.message }),
      );
      // expect(String(errorComp.element)).toContain("div");
      // HTMLDivElement.toString() is [object HTMLDivElement]
      // Use textContent for JSDOM
      expect(errorComp.element.textContent).toContain("Sync Error");
    });
  });

  describe("SSR Async", () => {
    const originalSSREnv = process.env.SEIDR_TEST_SSR;

    beforeEach(() => {
      process.env.SEIDR_TEST_SSR = "true";
    });

    afterEach(() => {
      if (originalSSREnv) {
        process.env.SEIDR_TEST_SSR = originalSSREnv;
      } else {
        delete process.env.SEIDR_TEST_SSR;
      }
      // clear hydration?
    });

    it("renderToString awaits inServer promises", async () => {
      const externalState = new Seidr<string>("initial");

      const App = () => {
        return component(() => {
          inServer(async () => {
            await new Promise((r) => setTimeout(r, 10)); // simulate fetch
            externalState.value = "fetched";
          });
          return $div({ textContent: externalState });
        });
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
