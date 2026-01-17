import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../seidr";
import { animate, tween } from "./animate";

describe("Animation Utilities", () => {
  let currentTime = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    currentTime = 0;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      return setTimeout(() => {
        currentTime += 16.666;
        cb(currentTime);
      }, 16.666);
    });

    vi.stubGlobal("cancelAnimationFrame", (id: any) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("animate()", () => {
    it("should call the callback with delta time", async () => {
      let totalDelta = 0;
      animate((delta) => {
        totalDelta += delta;
        return totalDelta >= 50 ? 1 : 0;
      });

      // Frame 1: ~16.6ms total. deltaMs is 0 on the very first frame of a batch
      vi.advanceTimersByTime(17);
      expect(totalDelta).toBe(0);

      // Frame 2: ~33.3ms total. deltaMs is ~16.6ms
      vi.advanceTimersByTime(17);
      expect(totalDelta).toBeCloseTo(16.666, 1);

      // Advance until it reaches 50
      vi.advanceTimersByTime(17 * 3);
      expect(totalDelta).toBeCloseTo(66.664, 1);

      const lastDelta = totalDelta;
      vi.advanceTimersByTime(17);
      expect(totalDelta).toBe(lastDelta); // Should have stopped
    });

    it("should allow manual stopping", () => {
      let callCount = 0;
      const stop = animate(() => {
        callCount++;
        return 0;
      });

      vi.advanceTimersByTime(17); // Frame 1 (delta 0)
      vi.advanceTimersByTime(17); // Frame 2 (delta 16.6)
      expect(callCount).toBe(2);

      stop();
      vi.advanceTimersByTime(17);
      expect(callCount).toBe(2);
    });
  });

  describe("tween()", () => {
    it("should tween a Seidr value over time", () => {
      const val = new Seidr(0);
      tween(val, 100, 100); // 100ms duration

      // Start: 0
      expect(val.value).toBe(0);

      // Advance halfway (plus one for the 0-delta first frame)
      vi.advanceTimersByTime(17 * 4);
      expect(val.value).toBeCloseTo(49.998, 1);

      // After 100ms+: exactly 100
      vi.advanceTimersByTime(100);
      expect(val.value).toBe(100);
    });

    it("should use easing function", () => {
      const val = new Seidr(0);
      // easeInQuad: t * t
      const t = tween(val, 100, 100, (t) => t * t);

      // Advance to frame 4: current time 4 * 16.666 = 66.664
      // Accumulated delta: (0) + 16.6 + 16.6 + 16.6 = 49.998
      // t = 49.998 / 100 = 0.5 (approx)
      // val = 100 * (0.5 * 0.5) = 25
      vi.advanceTimersByTime(17 * 4);
      expect(val.value).toBeCloseTo(25, 0);
      // Cleanup
      t.stop();
    });

    it("should return a promise that resolves when finished", async () => {
      const val = new Seidr(0);
      const promise = tween(val, 100, 100);

      vi.advanceTimersByTime(150);
      await expect(promise).resolves.toBeUndefined();
      expect(val.value).toBe(100);
    });

    it("should resolve and stop animation when stop() is called", async () => {
      const val = new Seidr(0);
      const t = tween(val, 100, 100);

      // Advance a bit
      vi.advanceTimersByTime(50);
      const currentValue = val.value;
      expect(currentValue).toBeGreaterThan(0);
      expect(currentValue).toBeLessThan(100);

      // Manually stop
      t.stop();

      // Should resolve immediately
      await expect(t).resolves.toBeUndefined();

      // Should not update further
      vi.advanceTimersByTime(100);
      expect(val.value).toBe(currentValue);
    });
  });
});
