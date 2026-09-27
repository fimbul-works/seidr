import { describe, expect, it, vi } from "vitest";
import { getAppState } from "../../app-state/app-state";
import { DATA_KEY_COMPONENT_CURSOR } from "../../constants";
import { mockComponentScope } from "../../test-setup/mock";
import { SeidrError } from "../../types";
import { onMounted } from "./on-mounted";

describe("onMounted", () => {
  describe("inside component scope", () => {
    const scope = mockComponentScope();

    it("should register callback on active component", () => {
      const callback = vi.fn();

      onMounted(callback);

      expect(scope.onMounted).toHaveBeenCalledWith(callback);
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
