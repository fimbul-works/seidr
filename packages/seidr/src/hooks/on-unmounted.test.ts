import { expect, it, vi } from "vitest";
import { getAppState } from "../app-state/app-state";
import { DATA_KEY_COMPONENT_CURSOR } from "../constants";
import { mount } from "../dom/mount";
import { describeDualMode } from "../test-setup";
import { onUnmounted } from "./on-unmounted";

describeDualMode("onUnmounted", ({ getDocument }) => {
  it("should register cleanup on active component", () => {
    const callback = vi.fn();

    const cleanup = mount(() => {
      onUnmounted(callback);
      return null;
    }, getDocument().body);

    cleanup();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should throw SeidrError without component scope (warn in test)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);

    onUnmounted(() => {});

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
