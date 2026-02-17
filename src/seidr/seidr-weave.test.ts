import { describe, expect, it, vi } from "vitest";
import { weave } from "./seidr-weave";
import type { Weave } from "./types";

describe("Weave", () => {
  it("should give access to an object", () => {
    const v = weave({ name: "foo" });
    expect(v.name).toBe("foo");
    v.name = "bar";
    expect(v.name).toBe("bar");
  });

  it("should be observable", () => {
    const v = weave({ name: "foo" });
    const listener = vi.fn();
    const cleanup = v.observe(listener);

    v.name = "bar";
    expect(listener).toHaveBeenCalledWith({ name: "bar" });
    cleanup();

    v.name = "baz";
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should be reactive", () => {
    const v = weave({ name: "foo" });
    const target = { name: "" };

    const listener = vi.fn();
    const cleanup = v.bind(target, (v, t) => ((t.name = v.name), listener(v)));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(v);
    expect(target.name).toBe("foo");

    v.name = "bar";
    expect(listener).toHaveBeenCalledTimes(2);
    expect(target.name).toBe("bar");
    cleanup();

    v.name = "baz";
    expect(listener).toHaveBeenCalledTimes(2);
    expect(target.name).toBe("bar");
  });

  it("should support nested keys", () => {
    const v = weave({ name: { first: "foo" } });

    expect(v.name).toBeTypeOf("object");
    expect(v.name.first).toBeTypeOf("string");
    expect(v.name.first).toBe("foo");

    const listener = vi.fn();
    const cleanup = v.observe(listener);

    v.name.first = "bar";
    expect(v.name.first).toBe("bar");
    expect(listener).toHaveBeenCalledTimes(1);
    cleanup();

    const childListener = vi.fn();
    const childCleanup = (v.name as Weave<{ first: string }>).observe(childListener, ["first"]);

    v.name.first = "baz";
    expect(v.name.first).toBe("baz");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);

    childCleanup();

    v.name.first = "qux";
    expect(listener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);
  });

  it("should handle the 'Colors' Weave scenario with nested re-assignment", () => {
    // A Weave representing a pallet of color Weaves
    const palette = weave({
      active: { r: 255, g: 255, b: 255, a: 1 },
      background: { r: 0, g: 0, b: 0, a: 1 },
    });

    const mockUIComponent = {
      colorString: "",
      updateCount: 0,
    };

    // Bind UI component to the 'active' color
    palette.bind(
      mockUIComponent,
      (p, target) => {
        const { r, g, b, a } = p.active;
        target.colorString = `rgba(${r},${g},${b},${a})`;
        target.updateCount++;
      },
      // ["active"], // This gets picked automatically during the function call
    );

    expect(mockUIComponent.colorString).toBe("rgba(255,255,255,1)");
    expect(mockUIComponent.updateCount).toBe(1);

    // Update property of the nested object
    palette.active.r = 200;
    expect(mockUIComponent.colorString).toBe("rgba(200,255,255,1)");
    expect(mockUIComponent.updateCount).toBe(2);

    // RE-ASSIGN the entire nested object
    palette.active = { r: 50, g: 50, b: 50, a: 0.5 };
    console.log(palette);
    // Should trigger update because 'active' changed identity
    expect(mockUIComponent.colorString).toBe("rgba(50,50,50,0.5)");
    expect(mockUIComponent.updateCount).toBe(3);

    // Update property on the NEWLY assigned object
    palette.active.g = 100;
    // Should still trigger since we re-attached listeners
    expect(mockUIComponent.colorString).toBe("rgba(50,100,50,0.5)");
    expect(mockUIComponent.updateCount).toBe(4);
  });

  it("should support conditional keys in bind", () => {
    const v = weave({
      type: "simple",
      simpleValue: 1,
      complexValue: { x: 10, y: 20 },
    });

    type VComplex = Weave<{ x: number; y: number }>;

    const output = { val: 0 };
    const listener = vi.fn();

    // Bind that depends on type. If type is complex, we need to track complexValue too.
    const cleanup = v.bind(
      output,
      (state, target) => {
        listener();
        if (state.type === "simple") {
          target.val = state.simpleValue;
        } else {
          target.val = state.complexValue.x + state.complexValue.y;
        }
      },
      ["type", "simpleValue", "complexValue"],
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(output.val).toBe(1);

    // Update simple value
    v.simpleValue = 2;
    expect(output.val).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);

    // Switch type to complex
    v.type = "complex";
    expect(output.val).toBe(30);
    expect(listener).toHaveBeenCalledTimes(3);

    // Update nested complex property
    (v.complexValue as VComplex).x = 100;
    expect(output.val).toBe(120);
    expect(listener).toHaveBeenCalledTimes(4);

    cleanup();
    v.simpleValue = 3;
    expect(listener).toHaveBeenCalledTimes(4);
  });
});
