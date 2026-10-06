import { expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state";
import { DATA_KEY_COMPONENT_CURSOR } from "../constants";
import { mount } from "../dom/mount";
import { describeDualMode } from "../test-setup";
import { SeidrError } from "../types";
import { onMounted } from "./on-mounted";

describeDualMode("onMounted", ({ getDocument }) => {
  it("should register callback on active component", () => {
    const callback = vi.fn();

    const cleanup = mount(() => {
      onMounted(callback);
      return null;
    }, getDocument().body);

    expect(callback).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("should throw SeidrError when called without component scope", () => {
    getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);

    expect(() => {
      onMounted(() => {});
    }).toThrow(SeidrError);
  });
});
