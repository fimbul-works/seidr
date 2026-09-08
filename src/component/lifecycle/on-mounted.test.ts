import { describe, expect, it, vi } from "vitest";
import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_CURSOR } from "../../constants";
import { mockComponentScope } from "../../test-setup/mock";
import { SeidrError } from "../../types";
import { onMounted, onMountedFns } from "./on-mounted";

describe("onMounted", () => {
  describe("with element target", () => {
    it("should register callback in onMounts map for the target element", () => {
      const el = document.createElement("div");
      const callback = vi.fn();

      onMounted(callback, el);

      expect(onMountedFns?.has(el)).toBe(true);
      expect(onMountedFns?.get(el)).toContain(callback);
    });

    it("should support multiple callbacks for the same element", () => {
      const el = document.createElement("span");
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      onMounted(cb1, el);
      onMounted(cb2, el);

      const registered = onMountedFns?.get(el);
      expect(registered).toEqual([cb1, cb2]);
    });
  });

  describe("inside component scope", () => {
    const scope = mockComponentScope();

    it("should register callback on active component", () => {
      const callback = vi.fn();

      onMounted(callback);

      expect(scope.onMount).toHaveBeenCalledWith(callback);
    });
  });

  describe("outside component scope", () => {
    it("should throw SeidrError when called without element and without component scope", () => {
      getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);

      expect(() => {
        onMounted(() => {});
      }).toThrow(SeidrError);
    });
  });
});
