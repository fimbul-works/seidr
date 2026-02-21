import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync } from "./scheduler";
import { Seidr } from "./seidr";

describe("Seidr Scheduler (Batching)", () => {
  beforeEach(() => {
    process.env.USE_SCHEDULER = "true";
  });

  afterEach(() => {
    delete process.env.USE_SCHEDULER;
  });

  it("should batch multiple updates in a single microtask", async () => {
    const s = new Seidr(0);
    const handler = vi.fn();
    s.observe(handler);

    s.value = 1;
    s.value = 2;
    s.value = 3;

    // Synchronously, the handler should NOT have been called yet
    expect(handler).not.toHaveBeenCalled();

    // After a microtask, it should have been called EXACTLY once with the final value
    await Promise.resolve();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(3);
  });

  it("should update synchronously if sync option is true", () => {
    const s = new Seidr(0, { sync: true });
    const handler = vi.fn();
    s.observe(handler);

    s.value = 1;
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it("should support manual flushing via flushSync", () => {
    const s = new Seidr(0);
    const handler = vi.fn();
    s.observe(handler);

    s.value = 1;
    expect(handler).not.toHaveBeenCalled();

    flushSync();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it("should handle nested updates in the same microtask", async () => {
    const a = new Seidr(0);
    const b = new Seidr(0);
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    a.observe((val) => {
      handlerA(val);
      if (val === 1) b.value = 1;
    });
    b.observe(handlerB);

    a.value = 1;

    await Promise.resolve();

    expect(handlerA).toHaveBeenCalledWith(1);
    expect(handlerB).toHaveBeenCalledWith(1);
    // Both should be flushed in the same tick despite nested set
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });
});
