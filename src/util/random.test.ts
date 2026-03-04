import { beforeEach, describe, expect, it } from "vitest";
import { resetRequestIdCounter, runWithAppState } from "../app-state/app-state.node";
import { resetNextId } from "../app-state/reset-next-id";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { random } from "./random";

describe("random", () => {
  let cleanup: CleanupFunction;

  beforeEach(() => {
    resetRequestIdCounter();
    resetNextId();
  });

  it("should return a number between 0 and 1", () => {
    cleanup = enableClientMode();
    const val = random();
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
    cleanup();
  });

  it("should produce different values on subsequent calls in same context", async () => {
    enableSSRMode();

    await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      expect(r1).not.toBe(r2);
      return [];
    });

    enableClientMode();
  });

  it("should produce different values on subsequent calls in different contexts", async () => {
    enableSSRMode();

    const results1 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    const results2 = await runWithAppState(async () => {
      const r1 = random();
      const r2 = random();
      return [r1, r2];
    });

    expect(results1).not.toEqual(results2);

    enableClientMode();
  });

  it("should match values between SSR and hydration when IDs match", async () => {
    resetRequestIdCounter();
    // 1. "Server" render
    enableSSRMode();
    const serverValues = await runWithAppState(async () => {
      return [random(), random()];
    });
    enableClientMode();

    resetRequestIdCounter();
    resetNextId();

    const clientValues = [random(), random()];

    expect(clientValues).toEqual(serverValues);
  });
});
