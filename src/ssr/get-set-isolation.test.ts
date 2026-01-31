import { describe, expect, it } from "vitest";
import { runWithRenderContext } from "../render-context/render-context.node";
import { useState } from "../state";

describe("SSR useState isolation", () => {
  it("should isolate state between different render contexts", async () => {
    // Request/Context 1
    await runWithRenderContext(async () => {
      const [state, setState] = useState<number>("ssr-shared-key");
      // Should be undefined initially
      expect(state.value).toBeUndefined();

      // Set value for context 1
      setState(100);
      expect(state.value).toBe(100);
    });

    // Request/Context 2
    await runWithRenderContext(async () => {
      const [state, setState] = useState<number>("ssr-shared-key");
      // Should NOT see value from context 1
      expect(state.value).toBeUndefined();

      // Set value for context 2
      setState(200);
      expect(state.value).toBe(200);
    });
  });

  it("should support concurrent access correctly", async () => {
    // Simulate concurrent requests
    const p1 = runWithRenderContext(async () => {
      const [state, setState] = useState<number>("ssr-concurrent-key");
      setState(1);
      // Simulate work
      await new Promise((r) => setTimeout(r, 10));
      expect(state.value).toBe(1);
      return state.value;
    });

    const p2 = runWithRenderContext(async () => {
      const [state, setState] = useState<number>("ssr-concurrent-key");
      setState(2);
      // Simulate work
      await new Promise((r) => setTimeout(r, 10));
      expect(state.value).toBe(2);
      return state.value;
    });

    const [val1, val2] = await Promise.all([p1, p2]);
    expect(val1).toBe(1);
    expect(val2).toBe(2);
  });
});
