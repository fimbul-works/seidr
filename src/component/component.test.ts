import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { useScope } from "./use-scope";

describeDualMode("component", () => {
  let restoreClientMode: CleanupFunction;

  beforeEach(() => {
    restoreClientMode = enableClientMode();
  });

  afterEach(() => {
    restoreClientMode();
  });

  it("should create a component returning an element", () => {
    const mockElement = $("div");
    const comp = component(() => {
      return mockElement;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBe(mockElement);
  });

  it("should create a component returning an array of elements", () => {
    const mockElement = [$("div"), $("span")];
    const comp = component(() => {
      return mockElement;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toHaveLength(2);
    expect(comp.element).toEqual([mockElement[0], mockElement[1]]);
  });

  it("should create a component returning null", () => {
    const comp = component(() => {
      return null;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBeNull();
  });

  it("should call destroy logic when component is unmounted", () => {
    let scopeDestroyed = false;

    const comp = component(() => {
      const scopeParam = useScope();
      scopeParam.track(() => (scopeDestroyed = true));
      return $("div");
    })();

    expect(scopeDestroyed).toBe(false);

    comp.unmount();

    expect(scopeDestroyed).toBe(true);
  });

  it("should execute cleanups immediately if already unmounted", () => {
    const comp = component(() => $("div"))();
    comp.unmount();

    const cleanup = vi.fn();
    comp.track(cleanup);

    expect(cleanup).toHaveBeenCalled();
  });

  it("should unmount child components recursively", () => {
    let childDestroyed = false;
    const Child = component(() => {
      useScope().track(() => (childDestroyed = true));
      return $("span");
    });

    const Parent = component(() => {
      const scope = useScope();
      scope.child(Child());
      return $("div");
    });

    const parent = Parent();
    expect(childDestroyed).toBe(false);

    parent.unmount();
    expect(childDestroyed).toBe(true);
  });
});
