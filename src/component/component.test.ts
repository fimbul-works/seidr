import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { useScope } from "./use-scope";

describeDualMode("component", ({ getDocument }) => {
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
    const cleanup = vi.fn();

    const comp = component(() => {
      const scopeParam = useScope();
      scopeParam.onUnmount(cleanup);
      return $("div");
    })();

    comp.mount(container);

    expect(cleanup).not.toHaveBeenCalled();

    comp.unmount();

    expect(cleanup).toHaveBeenCalled();
  });

  it.only("should unmount child components recursively", () => {
    const cleanup = vi.fn();

    const Child = component(() => {
      useScope().onUnmount(cleanup);
      return $("span");
    }, "Child");

    const Parent = component(() => {
      return $("div", null, Child());
    }, "Parent");

    Parent().mount(container);
    expect(cleanup).not.toHaveBeenCalled();

    Parent().unmount();
    expect(cleanup).toHaveBeenCalled();
  });

  it("should support multiple onMount callbacks", () => {
    const mount1 = vi.fn();
    const mount2 = vi.fn();
    const parentNode = document.createElement("div");

    const comp = component(() => {
      const scope = useScope();
      scope.onMount(mount1);
      scope.onMount(mount2);
      return $("span");
    })();

    expect(mount1).not.toHaveBeenCalled();
    expect(mount2).not.toHaveBeenCalled();

    comp.mount(parentNode);

    expect(mount1).toHaveBeenCalledWith(parentNode);
    expect(mount2).toHaveBeenCalledWith(parentNode);
  });

  it("should support multiple onUnmount callbacks", () => {
    const unmount1 = vi.fn();
    const unmount2 = vi.fn();

    const comp = component(() => {
      const scope = useScope();
      scope.onUnmount(unmount1);
      scope.onUnmount(unmount2);
      return $("span");
    })();

    comp.mount(container);

    comp.unmount();

    expect(unmount1).toHaveBeenCalled();
    expect(unmount2).toHaveBeenCalled();
  });
});
