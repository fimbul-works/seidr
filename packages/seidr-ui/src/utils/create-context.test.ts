import { describeDualMode } from "@fimbul-works/seidr/testing";
import { expect, it } from "vitest";
import { createContext } from "./create-context.js";

describeDualMode("createContext", () => {
  it("should push, get, and pop context values correctly", () => {
    const ctx = createContext<{ id: string }>("Test");

    expect(ctx.get()).toBeUndefined();
    expect(() => ctx.use()).toThrow();

    ctx.push({ id: "first" });
    expect(ctx.get()?.id).toBe("first");
    expect(ctx.use().id).toBe("first");

    ctx.push({ id: "second" });
    expect(ctx.get()?.id).toBe("second");

    const popped = ctx.pop();
    expect(popped?.id).toBe("second");
    expect(ctx.get()?.id).toBe("first");

    ctx.pop();
    expect(ctx.get()).toBeUndefined();
  });

  it("should execute runWith and automatically clean up", () => {
    const ctx = createContext<number>("NumberTest");

    expect(ctx.get()).toBeUndefined();

    const result = ctx.runWith(42, () => {
      expect(ctx.use()).toBe(42);
      return ctx.runWith(100, () => {
        expect(ctx.use()).toBe(100);
        return "nested";
      });
    });

    expect(result).toBe("nested");
    expect(ctx.get()).toBeUndefined();
  });

  it("should clean up context even if callback throws", () => {
    const ctx = createContext<string>("ErrorTest");

    expect(() => {
      ctx.runWith("active", () => {
        expect(ctx.use()).toBe("active");
        throw new Error("test error");
      });
    }).toThrow("test error");

    expect(ctx.get()).toBeUndefined();
  });
});
