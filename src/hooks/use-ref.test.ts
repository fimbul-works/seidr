import { expect } from "vitest";
import { mount } from "../dom";
import { isHTMLElement } from "../dom/type-guards";
import { $canvas } from "../elements/canvas";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { onMounted } from "./on-mounted";
import { useRef } from "./use-ref";

describeDualMode("useRef hook", ({ getDocument }) => {
  itHasParity("can access element after mount", () => {
    let canvas: HTMLCanvasElement | null = null;

    const CanvasContainer = () => {
      const canvasRef = useRef<HTMLCanvasElement>();

      onMounted(() => {
        canvas = canvasRef();
      });

      return $canvas({ id: "hero-canvas", ref: canvasRef });
    };

    const unmount = mount(CanvasContainer, getDocument().body);

    expect(isHTMLElement(canvas)).toBeTruthy();
    expect(canvas!.tagName).toBe("CANVAS");

    unmount();
  });
});
