import { describe, expect, it, vi } from "vitest";
import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_CURSOR } from "../../constants";
import { mockComponentScope } from "../../test-setup/mock";
import { SeidrError } from "../../types";
import { onUnmounted, onUnmountedFns } from "./on-unmounted";

describe("onUnmounted", () => {
  describe("with element target", () => {
    it("should register cleanup callback in onUnmounts map for the target element", () => {
      const el = document.createElement("div");
      const cleanup = vi.fn();

      onUnmounted(cleanup, el);

      expect(onUnmountedFns?.has(el)).toBe(true);
      expect(onUnmountedFns?.get(el)).toContain(cleanup);
    });

    it("should support multiple cleanups for the same element", () => {
      const el = document.createElement("button");
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      onUnmounted(cleanup1, el);
      onUnmounted(cleanup2, el);

      const registered = onUnmountedFns?.get(el);
      expect(registered).toEqual([cleanup1, cleanup2]);
    });
  });

  describe("inside component scope", () => {
    const scope = mockComponentScope();

    it("should register cleanup on active component onUnmountedFns", () => {
      const cleanup = vi.fn();

      scope.onUnmount(cleanup);
      scope.unmount();
      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe("outside component scope", () => {
    it("should throw SeidrError when called without element and without component scope", () => {
      getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);

      expect(() => {
        onUnmounted(() => {});
      }).toThrow(SeidrError);
    });
  });
});
