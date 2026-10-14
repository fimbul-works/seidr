import { describe, expect, it, vi } from "vitest";
import { createComponent } from "../component/create-component.js";
import { mount } from "../dom/mount.js";
import { $div } from "../elements/div.js";
import { createValue } from "../observable/value.js";
import { SeidrError } from "../types.js";
import { useEffect } from "./use-effect.js";
import { useRef } from "./use-ref.js";

describe("useEffect", () => {
  it("throws SeidrError when callback is not a function", () => {
    expect(() => useEffect(null as any, [])).toThrow(SeidrError);
    expect(() => useEffect(123 as any, [])).toThrow(SeidrError);
  });

  it("throws SeidrError when dependencies are not an array", () => {
    expect(() => useEffect(() => {}, null as any)).toThrow(SeidrError);
    expect(() => useEffect(() => {}, {} as any)).toThrow(SeidrError);
  });

  it("throws SeidrError when dependency is not a Value or Ref", () => {
    expect(() => useEffect(() => {}, [123 as any])).toThrow(SeidrError);
    expect(() => useEffect(() => {}, ["string" as any])).toThrow(SeidrError);
    expect(() => useEffect(() => {}, [{} as any])).toThrow(SeidrError);
  });

  it("executes effect on mount with empty dependencies", () => {
    const effectFn = vi.fn();

    const Comp = createComponent(() => {
      useEffect(effectFn, []);
      return $div({}, "Hello");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    expect(effectFn).not.toHaveBeenCalled();

    const unmount = mount(Comp, root);

    expect(effectFn).toHaveBeenCalledTimes(1);

    unmount();
    root.remove();
  });

  it("calls cleanup on unmount with empty dependencies", () => {
    const cleanupFn = vi.fn();
    const effectFn = vi.fn(() => cleanupFn);

    const Comp = createComponent(() => {
      useEffect(effectFn, []);
      return $div({}, "Hello");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    const unmount = mount(Comp, root);
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(cleanupFn).not.toHaveBeenCalled();

    unmount();
    expect(cleanupFn).toHaveBeenCalledTimes(1);
    root.remove();
  });

  it("re-runs effect when observed Value dependency changes", () => {
    const count = createValue(0);
    const executionValues: number[] = [];
    const cleanupValues: number[] = [];

    const Comp = createComponent(() => {
      useEffect(() => {
        const current = count();
        executionValues.push(current);
        return () => {
          cleanupValues.push(current);
        };
      }, [count]);

      return $div({}, "Count");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    const unmount = mount(Comp, root);

    // Initial mount execution
    expect(executionValues).toEqual([0]);
    expect(cleanupValues).toEqual([]);

    // Update value: triggers cleanup of 0, then execution with 1
    count(1);
    expect(cleanupValues).toEqual([0]);
    expect(executionValues).toEqual([0, 1]);

    // Update value again: triggers cleanup of 1, then execution with 2
    count(2);
    expect(cleanupValues).toEqual([0, 1]);
    expect(executionValues).toEqual([0, 1, 2]);

    // Unmount triggers final cleanup
    unmount();
    expect(cleanupValues).toEqual([0, 1, 2]);

    // Subsequent updates do not re-run effect
    count(3);
    expect(executionValues).toEqual([0, 1, 2]);

    root.remove();
  });

  it("re-runs effect when observed Ref dependency changes", () => {
    const elementRef = useRef<HTMLElement>();
    const runs: (HTMLElement | null)[] = [];

    const Comp = createComponent(() => {
      useEffect(() => {
        runs.push(elementRef());
      }, [elementRef]);

      return $div({}, "Ref");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    const unmount = mount(Comp, root);

    expect(runs).toEqual([null]);

    const el = document.createElement("p");
    elementRef(el);

    expect(runs).toEqual([null, el]);

    unmount();
    root.remove();
  });

  it("tracks multiple dependencies", () => {
    const a = createValue(1);
    const b = createValue("x");
    const log: string[] = [];

    const Comp = createComponent(() => {
      useEffect(() => {
        log.push(`${a()}-${b()}`);
      }, [a, b]);

      return $div({}, "Multi");
    });

    const root = document.createElement("div");
    document.body.appendChild(root);

    const unmount = mount(Comp, root);

    expect(log).toEqual(["1-x"]);

    a(2);
    expect(log).toEqual(["1-x", "2-x"]);

    b("y");
    expect(log).toEqual(["1-x", "2-x", "2-y"]);

    unmount();
    root.remove();
  });
});
