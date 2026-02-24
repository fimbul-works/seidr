import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../seidr";
import { enableClientMode, enableSSRMode, mockUseScope } from "../test-setup";
import { $ } from "./create-element";

describe("$ Bidirectional Mapping", () => {
  mockUseScope();

  describe("SSR Mode", () => {
    let cleanup: () => void;

    beforeEach(() => {
      cleanup = enableSSRMode();
    });

    afterEach(() => cleanup());

    it("should handle camelCase data props", () => {
      const el = $("div", { dataUserId: "123" });
      expect(el.toString()).toBe('<div data-user-id="123"></div>');
      expect(el.dataset.userId).toBe("123");
    });

    it("should handle camelCase aria props", () => {
      const el = $("div", { ariaLabel: "test" });
      expect(el.toString()).toBe('<div aria-label="test"></div>');
      expect(el.getAttribute("aria-label")).toBe("test");
    });

    it("should handle reactive camelCase data props", () => {
      const userId = new Seidr("123");
      const el = $("div", { dataUserId: userId });
      expect(el.toString()).toContain('data-user-id="123"');

      userId.value = "456";
      expect(el.toString()).toContain('data-user-id="456"');
    });

    it("should handle reactive style object", () => {
      const color = new Seidr("red");
      const el = $("div", { style: { color } });
      expect(el.style.toString()).toBe("color: red;");

      color.value = "blue";
      expect(el.style.toString()).toBe("color: blue;");
    });
  });

  describe("Client Mode", () => {
    let cleanup: () => void;

    beforeEach(() => {
      cleanup = enableClientMode();
    });

    afterEach(() => cleanup());

    it("should handle camelCase data props", () => {
      const el = $("div", { dataUserId: "123" });
      expect(el.dataset.userId).toBe("123");
      expect(el.getAttribute("data-user-id")).toBe("123");
    });

    it("should handle camelCase aria props", () => {
      const el = $("div", { ariaLabel: "test" });
      // Not all browsers support el.ariaLabel, but el.getAttribute('aria-label') should work
      expect(el.getAttribute("aria-label")).toBe("test");
    });

    it("should handle reactive camelCase data props", () => {
      const userId = new Seidr("123");
      const el = $("div", { dataUserId: userId });
      expect(el.dataset.userId).toBe("123");

      userId.value = "456";
      expect(el.dataset.userId).toBe("456");
    });
  });
});
