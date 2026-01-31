import { describe, expect, it } from "vitest";
import { createServerHTMLElement } from "./server-html-element";

describe("SSR Bidirectional Mapping", () => {
  describe("dataset", () => {
    it("should sync setAttribute and dataset", () => {
      const el = createServerHTMLElement("div");
      el.setAttribute("data-user-id", "123");
      expect(el.dataset.userId).toBe("123");

      el.dataset.userId = "456";
      expect(el.getAttribute("data-user-id")).toBe("456");
    });

    it("should handle initial data attributes", () => {
      const el = createServerHTMLElement("div", { "data-foo-bar": "baz" });
      expect(el.dataset.fooBar).toBe("baz");
    });

    it("should be enumerable and support entries", () => {
      const el = createServerHTMLElement("div", { "data-a": "1", "data-b": "2" });
      const entries = Object.entries(el.dataset);
      expect(entries).toContainEqual(["a", "1"]);
      expect(entries).toContainEqual(["b", "2"]);
    });

    it("should render correctly in toString()", () => {
      const el = createServerHTMLElement("div");
      el.dataset.testValue = "hello";
      expect(el.toString()).toBe('<div data-test-value="hello"></div>');
    });
  });

  describe("ARIA properties", () => {
    it("should sync ariaLabel property and attribute", () => {
      const el = createServerHTMLElement("div");
      el.ariaLabel = "Close";
      expect(el.getAttribute("aria-label")).toBe("Close");
      expect(el.toString()).toContain('aria-label="Close"');

      el.setAttribute("aria-label", "Open");
      expect(el.ariaLabel).toBe("Open");
    });

    it("should handle initial aria props in camelCase", () => {
      const el = createServerHTMLElement("button", { ariaLabel: "Submit", ariaHidden: "true" });
      expect(el.getAttribute("aria-label")).toBe("Submit");
      expect(el.getAttribute("aria-hidden")).toBe("true");
      expect(el.toString()).toContain('aria-label="Submit"');
      expect(el.toString()).toContain('aria-hidden="true"');
    });

    it("should handle initial aria attributes in kebab-case", () => {
      const el = createServerHTMLElement("button", { "aria-label": "Submit" });
      expect(el.ariaLabel).toBe("Submit");
    });
  });

  describe("Style bidirectional", () => {
    it("should handle style as object in constructor", () => {
      const el = createServerHTMLElement("div", { style: { color: "red", marginTop: "10px" } });
      expect(el.style.toString()).toBe("color:red;margin-top:10px;");
      expect(el.toString()).toBe('<div style="color:red;margin-top:10px;"></div>');
    });

    it("should handle style as string in constructor", () => {
      const el = createServerHTMLElement("div", { style: "color: blue;" });
      expect(el.style.toString()).toBe("color:blue;");
    });

    it("should support property access and modification via style object", () => {
      const el = createServerHTMLElement("div");
      (el.style as any).backgroundColor = "blue";
      expect((el.style as any).backgroundColor).toBe("blue");
      expect(el.style.toString()).toBe("background-color:blue;");
      expect(el.toString()).toContain('style="background-color:blue;"');
    });

    it("should sync setAttribute('style', ...) with style object", () => {
      const el = createServerHTMLElement("div");
      el.setAttribute("style", "color: red; margin: 10px;");
      expect((el.style as any).color).toBe("red");
      expect((el.style as any).margin).toBe("10px");

      (el.style as any).margin = "20px";
      expect(el.getAttribute("style")).toBe("color:red;margin:20px;");
    });

    it("should not escape style values", () => {
      const el = createServerHTMLElement("div");
      const url = "url('foo.png?a=1&b=2')";
      (el.style as any).backgroundImage = url;
      expect(el.toString()).toContain(`style="background-image:${url};"`);
    });
  });
});
