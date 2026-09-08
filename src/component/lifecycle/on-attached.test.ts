import { describe, expect, it, vi } from "vitest";
import { mount } from "../../dom/mount";
import { assignProp } from "../../element/assign-prop";
import { createValue } from "../../observable/value";
import { mockComponentScope } from "../../test-setup/mock";
import { createComponent } from "../create-component";
import { onAttached, onAttachedFns } from "./on-attached";

describe("onAttached", () => {
  describe("with element target", () => {
    it("should execute callback immediately if the element is already connected to the DOM", () => {
      const el = document.createElement("canvas");
      document.body.appendChild(el);
      expect(el.isConnected).toBe(true);

      const callback = vi.fn();
      onAttached(callback, el);

      expect(callback).toHaveBeenCalledTimes(1);

      // Clean up
      el.remove();
    });

    it("should register callback in onAttacheds map if the element is not connected yet", () => {
      const el = document.createElement("canvas");
      expect(el.isConnected).toBe(false);

      const callback = vi.fn();
      onAttached(callback, el);

      expect(callback).not.toHaveBeenCalled();
      expect(onAttachedFns?.has(el)).toBe(true);
      expect(onAttachedFns?.get(el)).toContain(callback);
    });

    it("should support multiple callbacks for the same element", () => {
      const el = document.createElement("div");
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      onAttached(cb1, el);
      onAttached(cb2, el);

      const registered = onAttachedFns?.get(el);
      expect(registered).toEqual([cb1, cb2]);
    });
  });

  describe("inside component scope", () => {
    const scope = mockComponentScope();

    it("should register callback on active component", () => {
      const callback = vi.fn();

      onAttached(callback);

      expect(scope.onAttach).toHaveBeenCalledWith(callback);
    });
  });

  describe("component integration with mount", () => {
    it("should trigger component-level onAttached when component is mounted to connected container", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      let attachedCalled = false;
      let canvasIsConnected = false;

      const TestCanvasComponent = createComponent(() => {
        let canvasEl: HTMLCanvasElement;
        onAttached(() => {
          attachedCalled = true;
          canvasIsConnected = canvasEl.isConnected;
        });

        canvasEl = document.createElement("canvas");
        return canvasEl;
      });

      const unmount = mount(TestCanvasComponent, container);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(attachedCalled).toBe(true);
      expect(canvasIsConnected).toBe(true);

      unmount();
      container.remove();
    });

    it("should trigger element ref Value binding with connected element when mounted", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const canvasRef = createValue<HTMLCanvasElement | null>(null);
      let boundCanvasConnected = false;

      canvasRef.bind((canvas) => {
        if (!canvas) return;
        boundCanvasConnected = canvas.isConnected;
      });

      const CanvasRefComponent = createComponent(() => {
        const canvasEl = document.createElement("canvas");
        assignProp(canvasEl, "ref", canvasRef);
        return canvasEl;
      });

      const unmount = mount(CanvasRefComponent, container);
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(canvasRef()).toBeInstanceOf(HTMLCanvasElement);
      expect(boundCanvasConnected).toBe(true);
      expect(canvasRef()?.isConnected).toBe(true);

      unmount();
      expect(canvasRef()).toBeNull();
      container.remove();
    });
  });
});
