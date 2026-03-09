import { afterEach, beforeEach, expect, it } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import { describeDualMode } from "../test-setup/dual-mode";
import type { CleanupFunction } from "../types";
import { component } from "./component";

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
});
