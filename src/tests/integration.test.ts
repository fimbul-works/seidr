import { beforeEach, describe, expect, it } from "vitest";
import { $, $a, $button, $div, $input, $query, $span, Seidr } from "../index.core";

describe("integration tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should create complex DOM structures", () => {
    const form = $("form", { id: "contact-form" }, [
      $("div", { className: "form-group" }, [
        $("label", { htmlFor: "name", textContent: "Name:" }),
        $input({ type: "text", id: "name", name: "name" }),
      ]),
      $("div", { className: "form-group" }, [
        $("label", { htmlFor: "email", textContent: "Email:" }),
        $input({ type: "email", id: "email", name: "email" }),
      ]),
      $("div", { className: "form-group" }, [$button({ type: "submit", textContent: "Submit" })]),
    ]);

    document.body.appendChild(form);

    expect($query("form#contact-form")).toBe(form);
    expect($query("input#name")).toBeTruthy();
    expect($query("input#email")).toBeTruthy();
    expect($query('button[type="submit"]')).toBeTruthy();

    const nameLabel = $query('label[for="name"]'); // Use 'for' instead of 'htmlFor' in CSS selector
    expect(nameLabel).toBeTruthy();
    expect(nameLabel?.textContent).toBe("Name:");
  });

  it("should handle event listeners in complex structures", () => {
    let clickCount = 0;

    const container = $div({ className: "container" }, [
      $button({
        className: "increment-btn",
        textContent: "Increment",
      }),
      $span({
        className: "counter",
        textContent: "Count: 0",
      }),
    ]);

    document.body.appendChild(container);

    const button = $query(".increment-btn") as HTMLButtonElement;
    const span = $query(".counter") as HTMLSpanElement;

    const cleanup = (button as any).on("click", () => {
      clickCount++;
      span.textContent = `Count: ${clickCount}`;
    });

    expect(span.textContent).toBe("Count: 0");
    expect(clickCount).toBe(0);

    button.click();
    button.click();

    expect(span.textContent).toBe("Count: 2");
    expect(clickCount).toBe(2);

    cleanup();
  });
});

describe("ReactiveProps - Seidr bindings", () => {
  describe("string observable bindings", () => {
    it("should update textContent when Seidr<string> changes", () => {
      const text = new Seidr("initial");
      const span = $span({ textContent: text });

      expect(span.textContent).toBe("initial");

      text.value = "updated";
      expect(span.textContent).toBe("updated");

      text.value = "final update";
      expect(span.textContent).toBe("final update");
    });

    it("should update className when Seidr<string> changes", () => {
      const className = new Seidr("initial-class");
      const div = $div({ className });

      expect(div.className).toBe("initial-class");

      className.value = "updated-class";
      expect(div.className).toBe("updated-class");
    });

    it("should update id when Seidr<string> changes", () => {
      const id = new Seidr("element-1");
      const button = $button({ id });

      expect(button.id).toBe("element-1");

      id.value = "element-2";
      expect(button.id).toBe("element-2");
    });

    it("should update href when Seidr<string> changes", () => {
      const href = new Seidr("/initial-path");
      const link = $a({ href });

      expect(link.href).toContain("/initial-path");

      href.value = "/updated-path";
      expect(link.href).toContain("/updated-path");
    });

    it("should update input placeholder when Seidr<string> changes", () => {
      const placeholder = new Seidr("Enter name");
      const input = $input({ type: "text", placeholder });

      expect(input.placeholder).toBe("Enter name");

      placeholder.value = "Enter your name";
      expect(input.placeholder).toBe("Enter your name");
    });

    it("should update input value when Seidr<string> changes", () => {
      const value = new Seidr("initial value");
      const input = $input({ type: "text", value });

      expect(input.value).toBe("initial value");

      value.value = "updated value";
      expect(input.value).toBe("updated value");
    });
  });

  describe("boolean observable bindings", () => {
    it("should update disabled when Seidr<boolean> changes", () => {
      const disabled = new Seidr(false);
      const button = $button({ disabled });

      expect(button.disabled).toBe(false);

      disabled.value = true;
      expect(button.disabled).toBe(true);

      disabled.value = false;
      expect(button.disabled).toBe(false);
    });

    it("should update hidden when Seidr<boolean> changes", () => {
      const hidden = new Seidr(false);
      const div = $div({ hidden });

      expect(div.hidden).toBe(false);

      hidden.value = true;
      expect(div.hidden).toBe(true);

      hidden.value = false;
      expect(div.hidden).toBe(false);
    });

    it("should update input readonly when Seidr<boolean> changes", () => {
      const readonly = new Seidr(false);
      const input = $input({ type: "text", readOnly: readonly }); // Note: readOnly, not readonly

      expect(input.readOnly).toBe(false);

      readonly.value = true;
      expect(input.readOnly).toBe(true);

      readonly.value = false;
      expect(input.readOnly).toBe(false);
    });

    it("should update input required when Seidr<boolean> changes", () => {
      const required = new Seidr(false);
      const input = $input({ type: "text", required });

      expect(input.required).toBe(false);

      required.value = true;
      expect(input.required).toBe(true);

      required.value = false;
      expect(input.required).toBe(false);
    });
  });

  describe("number observable bindings", () => {
    it("should update tabIndex when Seidr<number> changes", () => {
      const tabIndex = new Seidr(1);
      const button = $button({ tabIndex });

      expect(button.tabIndex).toBe(1);

      tabIndex.value = -1;
      expect(button.tabIndex).toBe(-1);

      tabIndex.value = 0;
      expect(button.tabIndex).toBe(0);
    });

    it("should update input maxLength when Seidr<number> changes", () => {
      const maxLength = new Seidr(10);
      const input = $input({ type: "text", maxLength });

      expect(input.maxLength).toBe(10);

      maxLength.value = 20;
      expect(input.maxLength).toBe(20);

      maxLength.value = 50;
      expect(input.maxLength).toBe(50);
    });

    it("should update input size when Seidr<number> changes", () => {
      const size = new Seidr(20);
      const input = $input({ type: "text", size });

      expect(input.size).toBe(20);

      size.value = 30;
      expect(input.size).toBe(30);
    });

    it("should update textarea cols when Seidr<number> changes", () => {
      const cols = new Seidr(40);
      const textarea = $("textarea", { cols });

      expect(textarea.cols).toBe(40);

      cols.value = 60;
      expect(textarea.cols).toBe(60);
    });
  });

  describe("mixed static and reactive properties", () => {
    it("should handle static and reactive properties together", () => {
      const className = new Seidr("dynamic-class");
      const button = $button({
        id: "static-id",
        className,
        type: "button",
        disabled: false,
      });

      // Static properties should be set immediately
      expect(button.id).toBe("static-id");
      expect(button.type).toBe("button");
      expect(button.disabled).toBe(false);

      // Reactive property should work normally
      expect(button.className).toBe("dynamic-class");
      className.value = "new-class";
      expect(button.className).toBe("new-class");

      // Static properties should remain unchanged
      expect(button.id).toBe("static-id");
      expect(button.type).toBe("button");
    });

    it("should handle multiple reactive properties on same element", () => {
      const className = new Seidr("class1");
      const disabled = new Seidr(false);
      const tabIndex = new Seidr(1);

      const button = $button({
        className,
        disabled,
        tabIndex,
        textContent: "Test Button",
      });

      expect(button.className).toBe("class1");
      expect(button.disabled).toBe(false);
      expect(button.tabIndex).toBe(1);
      expect(button.textContent).toBe("Test Button");

      // Update all reactive properties
      className.value = "class2";
      disabled.value = true;
      tabIndex.value = -1;

      expect(button.className).toBe("class2");
      expect(button.disabled).toBe(true);
      expect(button.tabIndex).toBe(-1);
      expect(button.textContent).toBe("Test Button"); // Static unchanged
    });
  });

  describe("reactive binding cleanup", () => {
    it("should stop updating DOM element after destroy", () => {
      const className = new Seidr("initial");
      const div = $div({ className });

      expect(div.className).toBe("initial");

      // Update to verify it's working
      className.value = "updated";
      expect(div.className).toBe("updated");

      // Destroy the element
      div.remove();

      // Update the observable again
      className.value = "should-not-update";

      // The DOM element should not have been updated
      expect(div.className).toBe("updated");
    });

    it("should cleanup all reactive bindings on element destroy", () => {
      const className = new Seidr("class1");
      const disabled = new Seidr(false);
      const tabIndex = new Seidr(1);

      const button = $button({
        className,
        disabled,
        tabIndex,
      });

      // Verify initial state
      expect(button.className).toBe("class1");
      expect(button.disabled).toBe(false);
      expect(button.tabIndex).toBe(1);

      // Update to verify bindings are active
      className.value = "class2";
      disabled.value = true;
      tabIndex.value = -1;

      expect(button.className).toBe("class2");
      expect(button.disabled).toBe(true);
      expect(button.tabIndex).toBe(-1);

      // Destroy element
      button.remove();

      // Update observables again
      className.value = "class3";
      disabled.value = false;
      tabIndex.value = 0;

      // DOM should not have been updated
      expect(button.className).toBe("class2");
      expect(button.disabled).toBe(true);
      expect(button.tabIndex).toBe(-1);
    });

    it("should handle child cleanup in parent destroy", () => {
      const childText = new Seidr("child");
      const parentClass = new Seidr("parent");

      const child = $span({ textContent: childText });
      const parent = $div({ className: parentClass }, [child]);

      expect(child.textContent).toBe("child");
      expect(parent.className).toBe("parent");

      // Update to verify bindings work
      childText.value = "updated child";
      parentClass.value = "updated parent";

      expect(child.textContent).toBe("updated child");
      expect(parent.className).toBe("updated parent");

      // Destroy parent
      parent.remove();

      // Update observables again
      childText.value = "final child";
      parentClass.value = "final parent";

      // Neither should have been updated
      expect(child.textContent).toBe("updated child");
      expect(parent.className).toBe("updated parent");
    });
  });

  describe("edge cases", () => {
    it("should handle rapid successive updates", () => {
      const text = new Seidr("initial");
      const span = $span({ textContent: text });

      expect(span.textContent).toBe("initial");

      // Rapid updates
      text.value = "update1";
      text.value = "update2";
      text.value = "update3";
      text.value = "final";

      expect(span.textContent).toBe("final");
    });

    it("should handle null and undefined values for string observables", () => {
      const text = new Seidr<string | null>("initial");
      const span = $span({ textContent: text });

      expect(span.textContent).toBe("initial");

      text.value = null;
      expect(span.textContent).toBe(""); // DOM converts null to empty string

      // @ts-expect-error
      text.value = undefined;
      expect(span.textContent).toBe(""); // DOM converts undefined to empty string

      text.value = "back to string";
      expect(span.textContent).toBe("back to string");
    });

    it("should handle zero values for number observables", () => {
      const tabIndex = new Seidr(5);
      const button = $button({ tabIndex });

      expect(button.tabIndex).toBe(5);

      tabIndex.value = 0;
      expect(button.tabIndex).toBe(0);

      tabIndex.value = -1;
      expect(button.tabIndex).toBe(-1);
    });

    it("should handle Seidr with same value updates efficiently", () => {
      const text = new Seidr("initial");
      const span = $span({ textContent: text });

      expect(span.textContent).toBe("initial");

      // Set to same value multiple times - this should be efficient due to Object.is check
      text.value = "initial";
      text.value = "initial";
      text.value = "initial";

      expect(span.textContent).toBe("initial");

      // Change to different value
      text.value = "changed";
      expect(span.textContent).toBe("changed");

      // Set back to same value again
      text.value = "changed";
      expect(span.textContent).toBe("changed");
    });
  });
});
