import { describe, expect, it } from "vitest";
import { getSetState } from "../core/state";
import { runWithRenderContext } from "../render-context.node";

describe("SSR getSetState isolation", () => {
  // Define getSetState accessor in global scope (outside of any request)
  const globalAccessor = getSetState<number>("ssr-shared-key");

  it("should isolate state between different render contexts even with global accessor", async () => {
    // Request/Context 1
    await runWithRenderContext(async () => {
      // Should be undefined initially
      expect(globalAccessor()).toBeUndefined();

      // Set value for context 1
      globalAccessor(100);
      expect(globalAccessor()).toBe(100);
    });

    // Request/Context 2
    await runWithRenderContext(async () => {
      // Should NOT see value from context 1
      expect(globalAccessor()).toBeUndefined();

      // Set value for context 2
      globalAccessor(200);
      expect(globalAccessor()).toBe(200);
    });

    // Verify independent existence
    // We can't easily verify "simultaneous existence" without mocking the context internals deeper,
    // but the sequential run above proves that Context 2 didn't inherit from Context 1
    // and that 'globalAccessor' is correctly resolving context lazily.
  });

  it("should support concurrent access correctly", async () => {
    // Simulate concurrent requests
    const p1 = runWithRenderContext(async () => {
      globalAccessor(1);
      // Simulate work
      await new Promise((r) => setTimeout(r, 10));
      expect(globalAccessor()).toBe(1);
      return globalAccessor();
    });

    const p2 = runWithRenderContext(async () => {
      globalAccessor(2);
      // Simulate work
      await new Promise((r) => setTimeout(r, 10));
      expect(globalAccessor()).toBe(2);
      return globalAccessor();
    });

    const [val1, val2] = await Promise.all([p1, p2]);
    expect(val1).toBe(1);
    expect(val2).toBe(2);
  });
});
