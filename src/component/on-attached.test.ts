import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { onAttached } from "./on-attached";
import { onMount } from "./on-mount";

describeDualMode("onAttached", ({ getDocument }) => {
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

  it("should execute callback when attached to the DOM", () => {
    const attached = vi.fn();

    const comp = component(() => {
      onAttached(attached);
      return $("span");
    })();

    expect(attached).not.toHaveBeenCalled();

    comp.mount(container);

    expect(attached).toHaveBeenCalled();
  });

  it("should support multiple onAttached callbacks", () => {
    const attached1 = vi.fn();
    const attached2 = vi.fn();

    const comp = component(() => {
      onMount(attached1);
      onMount(attached2);
      return $("span");
    })();

    expect(attached1).not.toHaveBeenCalled();
    expect(attached2).not.toHaveBeenCalled();

    comp.mount(container);

    expect(attached1).toHaveBeenCalled();
    expect(attached2).toHaveBeenCalled();
  });

  it("should call onAttached when child is added to the DOM", () => {
    const attached = vi.fn();

    const Child = component(() => {
      onMount(attached);
      return $("span");
    }, "Child");

    const Parent = component(() => {
      return $("div", null, Child());
    }, "Parent");

    expect(attached).not.toHaveBeenCalled();

    Parent().mount(container);

    expect(attached).toHaveBeenCalled();
  });
});
