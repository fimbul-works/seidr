import { describe, expect, it } from "vitest";
import { setRenderContextID } from "../../render-context.browser";
import { resetIdCounter, runWithRenderContext } from "../../render-context.node";
import { enableClientMode, enableSSRMode } from "../../test-setup";
import { random } from "./random";

describe("random", () => {
  let cleanup: () => void;

  it("should return a number between 0 and 1", () => {
    cleanup = enableClientMode();
    const val = random();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
    cleanup();
  });

  it("should produce different values on subsequent calls in same context", async () => {
    enableSSRMode();

    await runWithRenderContext(async () => {
      const r1 = random();
      const r2 = random();
      expect(r1).not.toBe(r2);
      return [];
    });

    enableClientMode();
  });

  it("should produce different values on subsequent calls in different contexts", async () => {
    enableSSRMode();

    const results1 = await runWithRenderContext(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    const results2 = await runWithRenderContext(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    expect(results1).not.toEqual(results2);

    enableClientMode();
  });

  it("should match values between SSR and hydration when IDs match", async () => {
    resetIdCounter();
    // 1. "Server" render
    enableSSRMode();
    const serverValues = await runWithRenderContext(async () => {
      return [random(), random()];
    });
    enableClientMode();

    // 2. "Client" hydration
    // Simulate what hydrate() does: set the ID from SSR
    setRenderContextID(0); // The first runWithRenderContext above used ID 0 (after a reset)

    const clientValues = [random(), random()];

    expect(clientValues).toEqual(serverValues);
  });
});
