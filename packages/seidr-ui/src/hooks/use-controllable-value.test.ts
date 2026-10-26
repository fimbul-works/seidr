import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it, vi } from "vitest";
import {
  useControllableArrayValue,
  useControllableBooleanValue,
  useControllableSetValue,
  useControllableValue,
} from "./use-controllable-value.js";

describe("useControllableValue", () => {
  it("handles uncontrolled mode with defaultValue and setter call", () => {
    const onChange = vi.fn();
    const value = useControllableValue<string>({
      defaultValue: "initial",
      onChange,
    });

    expect(value()).toBe("initial");
    expect(onChange).not.toHaveBeenCalled();

    value("updated");
    expect(value()).toBe("updated");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("updated", "initial");

    // Setting same value does not re-trigger onChange (createValue deduplicates)
    value("updated");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("handles updater callback in uncontrolled mode", () => {
    const onChange = vi.fn();
    const value = useControllableValue<number>({
      defaultValue: 10,
      onChange,
    });

    value((prev) => prev + 5);
    expect(value()).toBe(15);
    expect(onChange).toHaveBeenCalledWith(15, 10);
  });

  it("handles controlled mode with reactive Value", () => {
    const controlled = createValue("alpha");
    const onChange = vi.fn();
    const value = useControllableValue<string>({
      value: controlled,
      onChange,
    });

    expect(value()).toBe("alpha");

    controlled("beta");
    expect(value()).toBe("beta");
    expect(onChange).toHaveBeenCalledWith("beta", "alpha");

    value("gamma");
    expect(value()).toBe("gamma");
    expect(controlled()).toBe("gamma");
    expect(onChange).toHaveBeenCalledWith("gamma", "beta");
  });

  it("supports useControllableBooleanValue", () => {
    const flag = useControllableBooleanValue({});
    expect(flag()).toBe(false);

    flag(true);
    expect(flag()).toBe(true);
  });

  it("supports useControllableArrayValue", () => {
    const items = useControllableArrayValue<number>({});
    expect(items()).toEqual([]);

    items([1, 2, 3]);
    expect(items()).toEqual([1, 2, 3]);
  });

  it("supports useControllableSetValue", () => {
    const set = useControllableSetValue<string>({});
    expect(set().size).toBe(0);

    set(new Set(["a", "b"]));
    expect(set().has("a")).toBe(true);
    expect(set().size).toBe(2);
  });
});
