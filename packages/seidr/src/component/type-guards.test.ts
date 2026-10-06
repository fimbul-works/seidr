import { describe, expect, it } from "vitest";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { getDocument } from "../dom/get-document";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { createComponent } from "./create-component";
import { isComponent, isComponentFactory, isMarkerComment } from "./type-guards";
import { wrapComponent } from "./wrap-component";

describeDualMode("Component types", () => {
  describe("isComponent", () => {
    it("should return true for Component instances", () => {
      expect(isComponent(createComponent(() => $("div"))())).toBe(true);
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
      const value: unknown = createComponent(() => $("div"))();
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

  describe("isMarkerComment", () => {
    it("should return true for marker comments", () => {
      expect(isMarkerComment(getDocument().createComment(`${SEIDR_COMPONENT_START_PREFIX}Component-1`))).toBe(true);
      expect(isMarkerComment(getDocument().createComment(`${SEIDR_COMPONENT_END_PREFIX}Component-1`))).toBe(true);
    });

    it("should return false for non-marker comments", () => {
      expect(isMarkerComment(getDocument().createTextNode("text"))).toBe(false);
    });
  });
});
