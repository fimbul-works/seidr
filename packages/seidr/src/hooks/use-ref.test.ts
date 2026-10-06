import { expect } from "vitest";
import { createComponent } from "../component/create-component";
import { mount } from "../dom";
import { isHTMLElement } from "../dom/type-guards";
import { $canvas } from "../elements/canvas";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { SeidrError } from "../types";
import { onMounted } from "./on-mounted";
import { useRef } from "./use-ref";

describeDualMode("useRef hook", ({ getDocument }) => {
  itHasParity("can access element after mount", () => {
    let canvas: HTMLCanvasElement | null = null;

    const CanvasContainer = createComponent(() => {
      const canvasRef = useRef<HTMLCanvasElement>();

      onMounted(() => {
        canvas = canvasRef();
      });

      return $canvas({ id: "hero-canvas", ref: canvasRef });
    }, "CanvasContainer");

    const unmount = mount(CanvasContainer, getDocument().body);

    expect(isHTMLElement(canvas)).toBeTruthy();
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
      const objRef = useRef<StateContainer>();
      expect(objRef()).toBeNull();
      const state = { id: 1, label: "active" };
      objRef(state);
      expect(objRef()).toBe(state);
      expect(objRef()?.label).toBe("active");

      // 2. Array
      const arrayRef = useRef<number[]>();
      expect(arrayRef()).toBeNull();
      arrayRef([1, 2, 3]);
      expect(arrayRef()).toEqual([1, 2, 3]);

      // 3. Primitives (e.g. Timer ID, string, boolean)
      const timerRef = useRef<number>();
      expect(timerRef()).toBeNull();
      timerRef(42);
      expect(timerRef()).toBe(42);

      const strRef = useRef<string>();
      strRef("hello");
      expect(strRef()).toBe("hello");

      const boolRef = useRef<boolean>();
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
      const refWithInitial = useRef<number>(100);
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
      const ref = useRef<number>();

      expect(() => (ref as any)(undefined)).toThrow(SeidrError);

      return null;
    }, "TestComp");

    TestComp();
  });

  itHasParity("supports watch and bind callbacks", () => {
    const TestComp = createComponent(() => {
      const ref = useRef<{ count: number }>();
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
