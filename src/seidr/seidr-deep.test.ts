import { describe, expect, it, vi } from "vitest";
import { isWeave } from "../util";
import { Seidr } from "./seidr";

describe("Seidr Deep Reactivity", () => {
  it("should automatically turn assigned objects into Weaves", () => {
    const s = new Seidr({ a: 1 });
    expect(isWeave(s.value)).toBe(true);

    const s2 = new Seidr<any>(1);
    s2.value = { b: 2 };
    expect(isWeave(s2.value)).toBe(true);
  });

  it("should notify Seidr observers when a nested property in the Weave changes", () => {
    const s = new Seidr({ child: { val: 1 } });
    const listener = vi.fn();
    s.observe(listener);

    // Update nested property directly via the Weave
    s.value.child.val = 2;

    // The Seidr observer should have been triggered
    expect(listener).toHaveBeenCalledTimes(1);
    expect(s.value.child.val).toBe(2);
  });

  it("should cleanup internal listeners when value is replaced", () => {
    const s = new Seidr<any>({ a: 1 });
    const oldWeave = s.value;
    const listener = vi.fn();
    s.observe(listener);

    // Replace with a simple value
    s.value = 100;
    expect(listener).toHaveBeenCalledTimes(1);
    expect(s.value).toBe(100);

    // Updating the OLD weave should no longer trigger the Seidr listener
    oldWeave.a = 2;
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
