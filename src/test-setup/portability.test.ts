import { describe, expect, it, vi } from "vitest";

describe("Portability and Side-effects", () => {
  it("should not register Seidr or have side effects on import", async () => {
    // 0. Ensure clean state (since vitest runs tests in parallel/shared process)
    const { Seidr: SeidrClass } = await import("../seidr/seidr");
    (SeidrClass as any).register = undefined;
    vi.resetModules();

    // 1. Check Seidr registration
    const { Seidr } = await import("../seidr/seidr");
    expect(Seidr.register).toBeUndefined();

    // 2. Check getDocument contract
    const { getDocument } = await import("../dom/get-document");
    const { isClient } = await import("../util/environment/client");

    if (isClient()) {
      expect(getDocument()).toBe(window.document);
    } else {
      expect(() => getDocument()).toThrow(/not initialized/);
    }

    // 3. Check AppState contract
    const { getAppState } = await import("../app-state/app-state");
    expect(getAppState()).toBeDefined();
  });

  it("should become functional after explicit setup", async () => {
    const { Seidr } = await import("../seidr/seidr");
    const { getDocument } = await import("../dom/get-document");
    const { setAppStateProvider } = await import("../app-state/app-state");
    const { appState } = await import("../app-state/storage");
    const { registerSeidrForSSR } = await import("../ssr/register-seidr");

    Seidr.register = registerSeidrForSSR;
    setAppStateProvider(() => appState);

    expect(Seidr.register).toBeDefined();
    expect(getDocument()).toBeDefined();
    expect(getDocument()).toBe(window.document);
  });
});
