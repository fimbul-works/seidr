import { describe, expect, it } from "vitest";
import { createValue } from "../observable/value";
import { describeDualMode } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { SeidrError } from "../types";
import { assignProp } from "./assign-prop";
import { onAttachedFns } from "../component/lifecycle/on-attached";
import { onMountedFns } from "../component/lifecycle/on-mounted";
import { onUnmountedFns } from "../component/lifecycle/on-unmounted";

describeDualMode("assignProp", ({ getDocument }) => {
  mockComponentScope();

  // Helper to trigger lifecycle on elements in tests
  const triggerAttach = (el: HTMLElement) => {
    onAttachedFns?.get(el)?.forEach((fn) => fn());
  };

  const triggerMount = (el: HTMLElement) => {
    onMountedFns?.get(el)?.forEach((fn) => fn(el.parentElement!));
  };

  const triggerUnmount = (el: HTMLElement) => {
    onUnmountedFns?.get(el)?.forEach((fn) => fn());
  };

  describe("1. Ref Assignment & Lifecycle (prop === 'ref')", () => {
    it("should throw SeidrError if ref is not a reactive Value instance", () => {
      const el = getDocument().createElement("div");

      // Non-Value values should throw
      expect(() => assignProp(el, "ref", "invalid-string")).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", {})).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", () => {})).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", 123)).toThrow(SeidrError);
      expect(() => assignProp(el, "ref", null)).toThrow(SeidrError);
    });

    it("should bind element to ref Value on attach and set to null on unmount", () => {
      const el = getDocument().createElement("div");
      const ref = createValue<HTMLElement | null>(null);

      expect(ref()).toBeNull();

      assignProp(el, "ref", ref);

      // Trigger attached hook
      triggerAttach(el);
      expect(ref()).toBe(el);

      // Trigger unmounting hook
      triggerUnmount(el);
      expect(ref()).toBeNull();
    });

    it("should bind element immediately if element is already connected", () => {
      const el = getDocument().createElement("div");
      getDocument().body.appendChild(el);
      const ref = createValue<HTMLElement | null>(null);

      assignProp(el, "ref", ref);
      expect(ref()).toBe(el);

      el.remove();
      triggerUnmount(el);
      expect(ref()).toBeNull();
    });
  });

  describe("2. Property & Attribute Name Transformations", () => {
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

  describe("3. Style Assignment (prop === 'style')", () => {
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
      triggerUnmount(el);
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

      triggerUnmount(el);

      expect(color.observerCount).toBe(0);
      expect(fontSize.observerCount).toBe(0);
    });
  });

  describe("4. Boolean Attributes (BOOL_ATTRIBUTES)", () => {
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
      triggerUnmount(button);
      expect(isDisabled.observerCount).toBe(0);
    });
  });

  describe("5. Value Removal & Empty Values (isNullish)", () => {
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

  describe("6. General Reactive Value Binding & Lifecycle Cleanup", () => {
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

      triggerUnmount(el);

      expect(id.observerCount).toBe(0);
      expect(className.observerCount).toBe(0);

      // Updating values after unmount does not affect the element
      id("new-id");
      expect(el.id).toBe("main-id");
    });
  });

  describe("7. Reactive Value Swapping & Prop Reassignment", () => {
    it("should unsubscribe old Value and subscribe new Value when swapping Value prop", () => {
      const el = getDocument().createElement("div");
      const valA = createValue("Hello from A");
      const valB = createValue("Hello from B");

      assignProp(el, "title", valA);
      expect(el.title).toBe("Hello from A");
      expect(valA.observerCount).toBe(1);
      expect(valB.observerCount).toBe(0);

      // Swap to valB
      assignProp(el, "title", valB);
      expect(el.title).toBe("Hello from B");
      expect(valA.observerCount).toBe(0);
      expect(valB.observerCount).toBe(1);

      // Updating old valA does NOT mutate el
      valA("Stale A update");
      expect(el.title).toBe("Hello from B");

      // Updating active valB mutates el
      valB("Fresh B update");
      expect(el.title).toBe("Fresh B update");
    });

    it("should unsubscribe Value when replacing with a static value", () => {
      const el = getDocument().createElement("div");
      const val = createValue("Dynamic Title");

      assignProp(el, "title", val);
      expect(el.title).toBe("Dynamic Title");
      expect(val.observerCount).toBe(1);

      // Replace with static string
      assignProp(el, "title", "Static Title");
      expect(el.title).toBe("Static Title");
      expect(val.observerCount).toBe(0);

      // Updating val has no effect
      val("Ignored Update");
      expect(el.title).toBe("Static Title");
    });

    it("should not duplicate subscriptions when reassigning the same Value instance", () => {
      const el = getDocument().createElement("div");
      const val = createValue("Initial");

      assignProp(el, "title", val);
      expect(val.observerCount).toBe(1);

      // Reassign same instance
      assignProp(el, "title", val);
      expect(val.observerCount).toBe(1);
    });

    it("should handle swapping boolean attribute Value instances correctly", () => {
      const button = getDocument().createElement("button");
      const disabledA = createValue(true);
      const disabledB = createValue(false);

      assignProp(button, "disabled", disabledA);
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute("disabled")).toBe(true);
      expect(disabledA.observerCount).toBe(1);

      // Swap to disabledB (false)
      assignProp(button, "disabled", disabledB);
      expect(button.disabled).toBe(false);
      expect(button.hasAttribute("disabled")).toBe(false);
      expect(disabledA.observerCount).toBe(0);
      expect(disabledB.observerCount).toBe(1);

      // Changing disabledA has no effect
      disabledA(true);
      expect(button.disabled).toBe(false);

      // Changing disabledB works
      disabledB(true);
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute("disabled")).toBe(true);
    });

    it("should handle swapping reactive style properties and whole style strings", () => {
      const el = getDocument().createElement("div");
      const colorA = createValue("red");
      const colorB = createValue("blue");

      assignProp(el, "style", { color: colorA });
      expect(el.style.color).toBe("red");
      expect(colorA.observerCount).toBe(1);
      expect(colorB.observerCount).toBe(0);

      // Swap colorA with colorB
      assignProp(el, "style", { color: colorB });
      expect(el.style.color).toBe("blue");
      expect(colorA.observerCount).toBe(0);
      expect(colorB.observerCount).toBe(1);

      // Mutating colorA has no effect
      colorA("purple");
      expect(el.style.color).toBe("blue");

      // Mutating colorB works
      colorB("green");
      expect(el.style.color).toBe("green");

      // Replace object style with static string style
      assignProp(el, "style", "font-size: 20px;");
      expect(colorB.observerCount).toBe(0);
      expect(el.style.fontSize).toBe("20px");
    });

    it("should clean up swapped active bindings when component unmounts", () => {
      const el = getDocument().createElement("div");
      const valA = createValue("A");
      const valB = createValue("B");

      assignProp(el, "title", valA);
      assignProp(el, "title", valB);

      expect(valA.observerCount).toBe(0);
      expect(valB.observerCount).toBe(1);

      triggerUnmount(el);
      expect(valB.observerCount).toBe(0);
    });
  });
});
