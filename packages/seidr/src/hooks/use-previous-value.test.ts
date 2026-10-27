import { describe, expect, it } from "vitest";
import { $div } from "../elements/div.js";
import { createComponent, createValue, mount, SeidrError } from "../index.js";
import { usePreviousValue } from "./use-previous-value.js";

describe("usePreviousValue", () => {
  it("throws SeidrError when argument is not a valid Value", () => {
    expect(() => usePreviousValue(null as any)).toThrow(SeidrError);
    expect(() => usePreviousValue(undefined as any)).toThrow(SeidrError);
    expect(() => usePreviousValue(123 as any)).toThrow(SeidrError);
    expect(() => usePreviousValue("test" as any)).toThrow(SeidrError);
    expect(() => usePreviousValue({} as any)).toThrow(SeidrError);
  });

  it("returns initial value of the given value", () => {
    const count = createValue(10);
    const prev = usePreviousValue(count);

    expect(prev()).toBe(10);
  });

  it("updates to previous value when the observable value changes", () => {
    const count = createValue(0);
    const prev = usePreviousValue(count);

    expect(prev()).toBe(0);

    count(1);
    expect(count()).toBe(1);
    expect(prev()).toBe(0);

    count(2);
    expect(count()).toBe(2);
    expect(prev()).toBe(1);

    count(100);
    expect(count()).toBe(100);
    expect(prev()).toBe(2);
  });

  it("works with string values", () => {
    const text = createValue("initial");
    const prev = usePreviousValue(text);

    expect(prev()).toBe("initial");

    text("second");
    expect(prev()).toBe("initial");

    text("third");
    expect(prev()).toBe("second");
  });

  it("cleans up watcher when component is unmounted", () => {
    const count = createValue(1);
    let prevVal: any;

    const TestComponent = createComponent(() => {
      const prev = usePreviousValue(count);
      prevVal = prev;
      return $div({}, "Test");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    const unmount = mount(TestComponent, root);

    count(2);
    expect(prevVal()).toBe(1);

    // Unmount component
    unmount();

    // After unmounting, count changes should no longer update prevVal
    count(3);
    expect(prevVal()).toBe(1);

    root.remove();
  });
});
