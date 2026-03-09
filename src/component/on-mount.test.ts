import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { onMount } from "./on-mount";

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

  it("should execute callback when mounted", () => {
    const mount = vi.fn();
    const parentNode = document.createElement("div");

    const comp = component(() => {
      onMount(mount);
      return $("span");
    })();

    expect(mount).not.toHaveBeenCalled();

    comp.mount(parentNode);

    expect(mount).toHaveBeenCalledWith(parentNode);
  });

  it("should support multiple onMount callbacks", () => {
    const mount1 = vi.fn();
    const mount2 = vi.fn();
    const parentNode = document.createElement("div");

    const comp = component(() => {
      onMount(mount1);
      onMount(mount2);
      return $("span");
    })();

    expect(mount1).not.toHaveBeenCalled();
    expect(mount2).not.toHaveBeenCalled();

    comp.mount(parentNode);

    expect(mount1).toHaveBeenCalledWith(parentNode);
    expect(mount2).toHaveBeenCalledWith(parentNode);
  });

  it("should call onMount when child is mounted", () => {
    const mount = vi.fn();

    const Child = component(() => {
      onMount(mount);
      return $("span");
    }, "Child");

    const Parent = component(() => {
      return $("div", null, Child());
    }, "Parent");

    Parent();
    expect(mount).toHaveBeenCalled();
  });
});
