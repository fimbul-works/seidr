import { describe, expect, it } from "vitest";
import { createComponent } from "../component/create-component";
import { mount } from "../dom";
import { isElementNode } from "../dom/type-guards";
import { $canvas } from "../elements/canvas";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { SeidrError } from "../types";
import { composeRefs, createRef } from "./ref";
import { isRef } from "./type-guards";

describeDualMode("Ref handler", ({ getDocument }) => {
  describe("createRef", () => {
    itHasParity("can access element after mount", () => {
      let canvas: HTMLCanvasElement | null = null;

      const CanvasContainer = createComponent(() => {
        const canvasRef = createRef<HTMLCanvasElement>();

        canvasRef.bind((v) => (canvas = v));

        return $canvas({ id: "hero-canvas", ref: canvasRef });
      }, "CanvasContainer");

      const unmount = mount(CanvasContainer, getDocument().body);

      expect(isElementNode(canvas)).toBeTruthy();
      expect(canvas!.tagName).toBe("CANVAS");

      unmount();
    });

    itHasParity("can store and update plain objects, arrays, and primitives", () => {
      const TestComp = createComponent(() => {
        // 1. Plain Object
        interface StateContainer {
          id: number;
          label: string;
        }
        const objRef = createRef<StateContainer>();
        expect(objRef()).toBeNull();
        const state = { id: 1, label: "active" };
        objRef(state);
        expect(objRef()).toBe(state);
        expect(objRef()?.label).toBe("active");

        // 2. Array
        const arrayRef = createRef<number[]>();
        expect(arrayRef()).toBeNull();
        arrayRef([1, 2, 3]);
        expect(arrayRef()).toEqual([1, 2, 3]);

        // 3. Primitives (e.g. Timer ID, string, boolean)
        const timerRef = createRef<number>();
        expect(timerRef()).toBeNull();
        timerRef(42);
        expect(timerRef()).toBe(42);

        const strRef = createRef<string>();
        strRef("hello");
        expect(strRef()).toBe("hello");

        const boolRef = createRef<boolean>();
        boolRef(true);
        expect(boolRef()).toBe(true);

        // Setting back to null
        objRef(null);
        arrayRef(null);
        timerRef(null);
        expect(objRef()).toBeNull();
        expect(arrayRef()).toBeNull();
        expect(timerRef()).toBeNull();

        return null;
      }, "TestComp");

      TestComp();
    });

    itHasParity("can accept an optional initial value", () => {
      const TestComp = createComponent(() => {
        const refWithInitial = createRef<number>(100);
        expect(refWithInitial()).toBe(100);

        refWithInitial(200);
        expect(refWithInitial()).toBe(200);

        refWithInitial(null);
        expect(refWithInitial()).toBeNull();

        return null;
      }, "TestComp");

      TestComp();
    });

    itHasParity("throws SeidrError when setting undefined", () => {
      const TestComp = createComponent(() => {
        const ref = createRef<number>();

        expect(() => (ref as any)(undefined)).toThrow(SeidrError);

        return null;
      }, "TestComp");

      TestComp();
    });

    itHasParity("supports watch and bind callbacks", () => {
      const TestComp = createComponent(() => {
        const ref = createRef<{ count: number }>();
        const watchValues: (number | null)[] = [];
        const bindValues: (number | null)[] = [];

        const unwatch = ref.watch((val) => {
          watchValues.push(val ? val.count : null);
        });

        const unbind = ref.bind((val) => {
          bindValues.push(val ? val.count : null);
        });

        // bind immediately receives current value (null)
        expect(bindValues).toEqual([null]);
        expect(watchValues).toEqual([]);

        ref({ count: 10 });
        expect(watchValues).toEqual([10]);
        expect(bindValues).toEqual([null, 10]);

        ref({ count: 20 });
        expect(watchValues).toEqual([10, 20]);
        expect(bindValues).toEqual([null, 10, 20]);

        ref(null);
        expect(watchValues).toEqual([10, 20, null]);
        expect(bindValues).toEqual([null, 10, 20, null]);

        unwatch();
        unbind();

        ref({ count: 30 });
        // No more updates after unregistering
        expect(watchValues).toEqual([10, 20, null]);
        expect(bindValues).toEqual([null, 10, 20, null]);

        return null;
      }, "TestComp");

      TestComp();
    });
  });

  describe("composeRefs", () => {
    it("returns a valid Ref object", () => {
      const composite = composeRefs();
      expect(isRef(composite)).toBe(true);
      expect(composite()).toBeNull();
    });

    it("safely handles undefined and null refs", () => {
      const refA = createRef<HTMLDivElement>();
      const composite = composeRefs(refA, null, undefined);

      expect(isRef(composite)).toBe(true);

      const div = document.createElement("div");
      composite(div);

      expect(composite()).toBe(div);
      expect(refA()).toBe(div);
    });

    it("updates all constituent refs when composite ref is updated", () => {
      const refA = createRef<HTMLButtonElement>();
      const refB = createRef<HTMLButtonElement>();
      const refC = createRef<HTMLButtonElement>();

      const composite = composeRefs(refA, refB, refC);

      const btn = document.createElement("button");
      composite(btn);

      expect(composite()).toBe(btn);
      expect(refA()).toBe(btn);
      expect(refB()).toBe(btn);
      expect(refC()).toBe(btn);

      // Setting to null updates all constituent refs
      composite(null);
      expect(composite()).toBeNull();
      expect(refA()).toBeNull();
      expect(refB()).toBeNull();
      expect(refC()).toBeNull();
    });

    it("inherits initial value if one of the refs already has a value", () => {
      const element = document.createElement("span");
      const refA = createRef<HTMLSpanElement>(element);
      const refB = createRef<HTMLSpanElement>();

      const composite = composeRefs(refA, refB);

      expect(composite()).toBe(element);
    });

    it("supports watchers on the composite ref", () => {
      const refA = createRef<HTMLDivElement>();
      const composite = composeRefs(refA);

      let watchedValue: HTMLDivElement | null = null;
      composite.watch((val) => {
        watchedValue = val;
      });

      const div = document.createElement("div");
      composite(div);

      expect(watchedValue).toBe(div);
      expect(refA()).toBe(div);
    });
  });
});
