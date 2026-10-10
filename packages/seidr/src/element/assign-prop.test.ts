import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createComponent, type SeidrComponent } from "../component";
import { setComponentScope } from "../component/component-scope";
import { mount } from "../dom/mount";
import { useRef } from "../hooks";
import { createValue } from "../observable/value";
import { describeDualMode } from "../test-setup/dual-mode";
import { SeidrError } from "../types";
import { assignProp } from "./assign-prop";
import { $ } from "./create-element";

describeDualMode("assignProp", ({ getDocument }) => {
  const comp = createComponent(() => null);
  let scope: SeidrComponent;

  beforeEach(() => {
    scope = comp();
    setComponentScope(scope);
  });

  afterEach(() => {
    if (scope) scope.unmount();

    setComponentScope(null);
  });

  describe("Ref Assignment & Lifecycle (prop === 'ref')", () => {
    it("should throw SeidrError if ref is not a reactive Value instance", () => {
      const el = getDocument().createElement("div");

      // Non-Value values should throw
      expect(() => assignProp(el, "ref", "invalid-string")).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", {})).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", () => {})).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", 123)).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", null)).toThrow(SeidrError);
    });

    it("should bind element to ref Value on mount and set to null on unmount", () => {
      let ref: any;

      const unmount = mount(() => {
        ref = useRef();
        return $("div", { ref });
      }, getDocument().body);

      expect(ref()).toBeTruthy();

      unmount();

      expect(ref()).toBeNull();
    });
  });

  describe("Property & Attribute Name Transformations", () => {
    it("should handle explicit aria-* attributes (propStartsWith('aria-'))", () => {
      const el = getDocument().createElement("button");

      assignProp(el, "aria-label", "Close dialog");
      assignProp(el, "aria-hidden", "true");

      expect(el.getAttribute("aria-label")).toBe("Close dialog");
      expect(el.getAttribute("aria-hidden")).toBe("true");
    });

    it("should handle explicit data-* attributes (propStartsWith('data-'))", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "data-test-id", "submit-button");
      assignProp(el, "data-user-role", "admin");

      expect(el.getAttribute("data-test-id")).toBe("submit-button");
      expect(el.getAttribute("data-user-role")).toBe("admin");
    });

    it("should handle 'form' and 'value' attributes as attributes", () => {
      const button = getDocument().createElement("button");
      assignProp(button, "form", "my-form-id");
      expect(button.getAttribute("form")).toBe("my-form-id");

      const input = getDocument().createElement("input");
      assignProp(input, "value", "entered text");
      expect(input.getAttribute("value")).toBe("entered text");
    });

    it("should convert camelCase data* to kebab-case data-* (propStartsWith('data') && matchUpperCasePosition(4))", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "dataTestId", "widget-123");
      assignProp(el, "dataUserRole", "editor");

      expect(el.getAttribute("data-test-id")).toBe("widget-123");
      expect(el.getAttribute("data-user-role")).toBe("editor");
      expect(el.dataset.testId).toBe("widget-123");
      expect(el.dataset.userRole).toBe("editor");
    });

    it("should convert camelCase aria* to kebab-case aria-* when not in element", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "ariaCustomProp", "custom-value");
      expect(el.getAttribute("aria-custom-prop")).toBe("custom-value");

      assignProp(el, "ariaDescribedBy", "desc-1");
      expect(el.getAttribute("aria-described-by")).toBe("desc-1");
    });

    it("should convert htmlFor to 'for' attribute", () => {
      const label = getDocument().createElement("label");

      assignProp(label, "htmlFor", "user-email");
      expect(label.getAttribute("for")).toBe("user-email");
    });

    it("should convert className to 'class' attribute", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "className", "btn btn-primary active");
      expect(el.getAttribute("class")).toBe("btn btn-primary active");
    });

    it("should assign standard IDL DOM properties directly", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "id", "header-container");
      assignProp(el, "title", "Main Header");
      assignProp(el, "tabIndex", 1);

      expect(el.id).toBe("header-container");
      expect(el.title).toBe("Main Header");
      expect(el.tabIndex).toBe(1);
    });

    it("should assign custom attributes that do not exist on the target element", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "my-custom-attribute", "foo");
      expect(el.getAttribute("my-custom-attribute")).toBe("foo");
    });
  });

  describe("Style Assignment (prop === 'style')", () => {
    it("should handle style as a static string", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "style", "color: red; font-size: 16px;");
      expect(el.style.color).toBe("red");
      expect(el.style.fontSize).toBe("16px");
    });

    it("should handle style as a reactive Value<string>", () => {
      const el = getDocument().createElement("div");
      const styleText = createValue("color: red;");

      assignProp(el, "style", styleText);
      expect(el.style.color).toBe("red");

      styleText("color: blue; font-size: 18px;");
      expect(el.style.color).toBe("blue");
      expect(el.style.fontSize).toBe("18px");

      // Verify unmount cleanup
      expect(styleText.observerCount).toBe(1);

      scope.unmount();

      expect(styleText.observerCount).toBe(0);
    });

    it("should handle style as a static object", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "style", {
        color: "blue",
        fontSize: "14px",
        marginTop: "10px",
      });

      expect(el.style.color).toBe("blue");
      expect(el.style.fontSize).toBe("14px");
      expect(el.style.marginTop).toBe("10px");
    });

    it("should handle style object containing reactive Value properties", () => {
      const el = getDocument().createElement("div");
      const color = createValue("red");
      const fontSize = createValue("12px");

      assignProp(el, "style", {
        color,
        fontSize,
        opacity: "0.8",
      });

      expect(el.style.color).toBe("red");
      expect(el.style.fontSize).toBe("12px");
      expect(el.style.opacity).toBe("0.8");

      color("green");
      expect(el.style.color).toBe("green");

      fontSize("20px");
      expect(el.style.fontSize).toBe("20px");

      // Check observers count and cleanup
      expect(color.observerCount).toBe(1);
      expect(fontSize.observerCount).toBe(1);

      scope.unmount();

      expect(color.observerCount).toBe(0);
      expect(fontSize.observerCount).toBe(0);
    });
  });

  describe("Boolean Attributes (BOOL_ATTRIBUTES)", () => {
    it("should set empty string attribute for truthy boolean values", () => {
      const button = getDocument().createElement("button");
      const input = getDocument().createElement("input");
      const div = getDocument().createElement("div");

      assignProp(button, "disabled", true);
      assignProp(input, "required", true);
      assignProp(div, "hidden", true);

      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.getAttribute("disabled")).toBe("");
      expect(button.disabled).toBe(true);

      expect(input.hasAttribute("required")).toBe(true);
      expect(input.getAttribute("required")).toBe("");

      expect(div.hasAttribute("hidden")).toBe(true);
      expect(div.getAttribute("hidden")).toBe("");
      expect(div.hidden).toBe(true);
    });

    it("should remove boolean attribute when set to false", () => {
      const button = getDocument().createElement("button");
      button.setAttribute("disabled", "");

      assignProp(button, "disabled", false);

      expect(button.hasAttribute("disabled")).toBe(false);
      expect(button.disabled).toBe(false);
    });

    it("should remove boolean attribute when set to null or undefined", () => {
      const button = getDocument().createElement("button");

      assignProp(button, "disabled", true);
      expect(button.hasAttribute("disabled")).toBe(true);

      assignProp(button, "disabled", null);
      expect(button.hasAttribute("disabled")).toBe(false);

      assignProp(button, "disabled", true);
      expect(button.hasAttribute("disabled")).toBe(true);

      assignProp(button, "disabled", undefined);
      expect(button.hasAttribute("disabled")).toBe(false);
    });

    it("should handle reactive boolean attributes with Value<boolean>", () => {
      const button = getDocument().createElement("button");
      const isDisabled = createValue(false);

      assignProp(button, "disabled", isDisabled);

      expect(button.hasAttribute("disabled")).toBe(false);
      expect(button.disabled).toBe(false);

      // Toggle to true
      isDisabled(true);
      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.getAttribute("disabled")).toBe("");
      expect(button.disabled).toBe(true);

      // Toggle back to false
      isDisabled(false);
      expect(button.hasAttribute("disabled")).toBe(false);
      expect(button.disabled).toBe(false);

      // Cleanup on unmount
      expect(isDisabled.observerCount).toBe(1);

      scope.unmount();

      expect(isDisabled.observerCount).toBe(0);
    });
  });

  describe("Value Removal & Empty Values (isNullish)", () => {
    it("should remove custom and data attributes when value is null or undefined", () => {
      const el = getDocument().createElement("div");

      assignProp(el, "data-user", "Alice");
      expect(el.getAttribute("data-user")).toBe("Alice");

      assignProp(el, "data-user", null);
      expect(el.hasAttribute("data-user")).toBe(false);

      assignProp(el, "custom-id", "123");
      expect(el.getAttribute("custom-id")).toBe("123");

      assignProp(el, "custom-id", undefined);
      expect(el.hasAttribute("custom-id")).toBe(false);
    });

    it("should dynamically remove attribute when reactive Value becomes null or undefined", () => {
      const el = getDocument().createElement("div");
      const label = createValue<string | null>("initial label");

      assignProp(el, "aria-label", label);
      expect(el.getAttribute("aria-label")).toBe("initial label");

      label(null);
      expect(el.hasAttribute("aria-label")).toBe(false);

      label("restored label");
      expect(el.getAttribute("aria-label")).toBe("restored label");
    });
  });

  describe("General Reactive Value Binding & Lifecycle Cleanup", () => {
    it("should bind reactive property and update on changes", () => {
      const el = getDocument().createElement("div");
      const title = createValue("Initial Title");

      assignProp(el, "title", title);
      expect(el.title).toBe("Initial Title");

      title("Updated Title");
      expect(el.title).toBe("Updated Title");
    });

    it("should unregister all reactive bindings when component unmounts", () => {
      const el = getDocument().createElement("div");
      const id = createValue("main-id");
      const className = createValue("card");

      assignProp(el, "id", id);
      assignProp(el, "className", className);

      expect(id.observerCount).toBe(1);
      expect(className.observerCount).toBe(1);

      scope.unmount();

      expect(id.observerCount).toBe(0);
      expect(className.observerCount).toBe(0);

      // Updating values after unmount does not affect the element
      id("new-id");
      expect(el.id).toBe("main-id");
    });
  });
});
