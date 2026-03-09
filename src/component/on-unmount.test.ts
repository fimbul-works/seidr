import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { onUnmount } from "./on-unmount";

describeDualMode("onUnmount", ({ getDocument }) => {
  let restoreClientMode: CleanupFunction;
  let container: Element;

  beforeEach(() => {
    restoreClientMode = enableClientMode();
    container = getDocument().createElement("div");
    getDocument().body.appendChild(container);
  });

  afterEach(() => {
    restoreClientMode();
  });

  it("should execute callback when component is unmounted", () => {
    const cleanup = vi.fn();

    const comp = component(() => {
      onUnmount(cleanup);
      return $("div");
    })();

    comp.mount(container);

    expect(cleanup).not.toHaveBeenCalled();

    comp.unmount();

    expect(cleanup).toHaveBeenCalled();
  });

  it("should support multiple onUnmount callbacks", () => {
    const unmount1 = vi.fn();
    const unmount2 = vi.fn();

    const comp = component(() => {
      onUnmount(unmount1);
      onUnmount(unmount2);
      return $("span");
    })();

    comp.mount(container);

    comp.unmount();

    expect(unmount1).toHaveBeenCalled();
    expect(unmount2).toHaveBeenCalled();
  });

  it("should unmount child components recursively", () => {
    const cleanup = vi.fn();

    const Child = component(() => {
      onUnmount(cleanup);
      return $("span");
    }, "Child");

    const Parent = component(() => {
      return $("div", null, Child());
    }, "Parent");

    const parentInstance = Parent();
    parentInstance.mount(container);
    expect(cleanup).not.toHaveBeenCalled();

    parentInstance.unmount();
    expect(cleanup).toHaveBeenCalled();
  });
});
