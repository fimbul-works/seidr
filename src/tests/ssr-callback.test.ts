import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DataStrategy } from "../app-state/types.js";
import { component } from "../component/index.js";
import { $ } from "../element/index.js";
import { renderToString } from "../ssr/render-to-string.js";
import { enableSSRMode, resetRequestIdCounter } from "../test-setup/index.js";

describe("SSR Initialization Callback", () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = enableSSRMode();
    resetRequestIdCounter();
  });

  afterEach(() => {
    cleanup();
  });

  it("should execute the initialization callback in the correct request scope", async () => {
    let capturedStateId = -1;

    const App = component(() => {
      return $("div", { textContent: "Hello" });
    });

    await renderToString(App, (appState) => {
      capturedStateId = appState.ctxID;
    });

    expect(capturedStateId).toBeGreaterThan(-1);
  });

  it("should restore data returned from the initialization callback", async () => {
    let restoredValue = "";
    const mockStrategy: DataStrategy<string> = [
      () => restoredValue,
      (val) => {
        restoredValue = val;
      },
    ];

    const App = component(() => {
      return $("div", { textContent: restoredValue });
    });

    const { html } = await renderToString(App, (appState) => {
      appState.defineDataStrategy("mock", ...mockStrategy);
      return { mock: "Callback Data" };
    });

    expect(html).toContain("Callback Data");
    expect(restoredValue).toBe("Callback Data");
  });

  it("should handle async initialization callbacks", async () => {
    let restoredValue = "";
    const mockStrategy: DataStrategy<string> = [
      () => restoredValue,
      (val) => {
        restoredValue = val;
      },
    ];

    const App = component(() => {
      return $("div", { textContent: restoredValue });
    });

    const { html } = await renderToString(App, async (appState) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      appState.defineDataStrategy("mock", ...mockStrategy);
      return { mock: "Async Data" };
    });

    expect(html).toContain("Async Data");
    expect(restoredValue).toBe("Async Data");
  });
});
