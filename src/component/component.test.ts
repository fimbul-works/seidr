import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { useScope } from "./use-scope";

describe("component", () => {
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
    expect(comp.element[0]).toBe(mockElement[0]);
    expect(comp.element[1]).toBe(mockElement[1]);
  });

  it("should create a component returning null", () => {
    const comp = component(() => {
      return null;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBe(null);
  });

  it("should call destroy on scope when component is destroyed", () => {
    let scopeDestroyed = false;

    const comp = component(() => {
      const scopeParam = useScope();
      // Override destroy for testing
      const originalDestroy = scopeParam.destroy;
      scopeParam.destroy = () => {
        scopeDestroyed = true;
        originalDestroy();
      };
      return $("div");
    })();

    expect(scopeDestroyed).toBe(false);

    comp.element.remove();

    expect(scopeDestroyed).toBe(true);
  });
});
