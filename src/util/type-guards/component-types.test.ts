import { describe, expect, it } from "vitest";
import { component } from "../../component/index";
import { wrapComponent } from "../../component/wrap-component";
import { $ } from "../../element";
import { describeDualMode } from "../../test-setup";
import { isComponent, isComponentFactory } from "./component-types";

describeDualMode("Component types", () => {
  describe("isComponent", () => {
    it("should return true for Component instances", () => {
      expect(isComponent(component(() => $("div"))())).toBe(true);
    });

    it("should return false for non-Component values", () => {
      expect(isComponent(42)).toBe(false);
      expect(isComponent("hello")).toBe(false);
      expect(isComponent({ a: 1 })).toBe(false);
      expect(isComponent(null)).toBe(false);
      expect(isComponent(undefined)).toBe(false);
    });

    it("should return false for plain objects", () => {
      const fakeComponent = { value: 42, bind: () => {} };
      expect(isComponent(fakeComponent)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = component(() => $("div"))();
      if (isComponent(value)) {
        const _typed = value;
      }
    });
  });

  describe("isComponentFactory", () => {
    it("should return true for ComponentFactory instances", () => {
      const factory = wrapComponent(() => $("div"));
      expect(isComponentFactory(factory)).toBe(true);
    });

    it("should return false for non-ComponentFactory values", () => {
      expect(isComponentFactory(42)).toBe(false);
      expect(isComponentFactory("hello")).toBe(false);
      expect(isComponentFactory({ a: 1 })).toBe(false);
      expect(isComponentFactory(null)).toBe(false);
      expect(isComponentFactory(undefined)).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = wrapComponent(() => $("div"));
      if (isComponentFactory(value)) {
        const _typed = value;
      }
    });
  });
});
