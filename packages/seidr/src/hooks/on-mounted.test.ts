import { expect, it, vi } from "vitest";
import { DATA_KEY_COMPONENT_CURSOR } from "../../dist/component/component-scope";
import { getAppState } from "../app-state/get-app-state";
import { mount } from "../dom/mount";
import { describeDualMode } from "../test-setup";
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

  it("should throw SeidrError when called without component scope (warn in test)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getAppState().deleteData(DATA_KEY_COMPONENT_CURSOR);

    onMounted(() => {});

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
