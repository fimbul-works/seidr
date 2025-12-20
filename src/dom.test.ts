import { beforeEach, describe, expect, it, vi } from "vitest";
import { $, $$, AEl, ButtonEl, DivEl, InputEl, type SeidrElement, SpanEl, TextNode, el, makeEl, on } from "./dom.js";
import { ObservableValue } from "./value.js";

describe("makeEl", () => {
  it("should create basic HTML element", () => {
    const div = makeEl("div");

    expect(div.tagName).toBe("DIV");
    expect(div instanceof HTMLElement).toBe(true);
  });

  it("should assign properties to element", () => {
    const div = makeEl("div", {
      id: "test-id",
      className: "test-class",
      textContent: "Hello World",
    });

    expect(div.id).toBe("test-id");
    expect(div.className).toBe("test-class");
    expect(div.textContent).toBe("Hello World");
  });

  it("should append children to element", () => {
    const child1 = document.createElement("span");
    const child2 = document.createTextNode("text");
    const div = makeEl("div", {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);
  });

  it("should add on method to element", () => {
    const div = makeEl("div");

    expect("on" in div).toBe(true);
    expect(typeof (div as any).on).toBe("function");
  });

  it("should work with different HTML elements", () => {
    const button = makeEl("button", { type: "button", textContent: "Click me" });
    const input = makeEl("input", { type: "text", placeholder: "Enter text" });
    const anchor = makeEl("a", { href: "#", textContent: "Link" });

    expect(button.tagName).toBe("BUTTON");
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Click me");

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");
    expect(input.placeholder).toBe("Enter text");

    expect(anchor.tagName).toBe("A");
    expect(anchor.href).toContain("#");
    expect(anchor.textContent).toBe("Link");
  });
});

describe("el", () => {
  it("should return a function that creates elements", () => {
    const createDiv = el("div");
    const div = createDiv({ className: "test" });

    expect(typeof createDiv).toBe("function");
    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("test");
  });

  it("should create specialized element creators", () => {
    const createInput = el("input");
    const createButton = el("button");

    const input = createInput({ type: "number", value: "42" });
    const button = createButton({ textContent: "Submit" });

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("number");
    expect(input.value).toBe("42");

    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Submit");
  });

  it("should handle optional parameters correctly", () => {
    const createDiv = el("div");

    // No parameters
    const div1 = createDiv();
    expect(div1.tagName).toBe("DIV");

    // Only props
    const div2 = createDiv({ id: "test" });
    expect(div2.id).toBe("test");

    // Props and children
    const child = document.createElement("span");
    const div3 = createDiv({ id: "parent" }, [child]);
    expect(div3.id).toBe("parent");
    expect(div3.contains(child)).toBe(true);
  });
});

describe("on (event listeners)", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("should add event listener and return cleanup function", () => {
    const handler = vi.fn();
    const cleanup = on(element, "click", handler);

    expect(typeof cleanup).toBe("function");

    // Trigger event
    element.click();

    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    cleanup();

    // Trigger event again
    element.click();

    // Handler should not be called again
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should work with different event types", () => {
    const clickHandler = vi.fn();
    const keydownHandler = vi.fn();

    const clickCleanup = on(element, "click", clickHandler);
    const keydownCleanup = on(element, "keydown", keydownHandler);

    element.click();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(keydownHandler).toHaveBeenCalledTimes(1);

    clickCleanup();
    keydownCleanup();
  });

  it("should pass correct event arguments to handler", () => {
    const handler = vi.fn();
    on(element, "click", handler);

    element.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    // 'this' context is not captured in the mock calls array, so we can't test it directly
  });

  it("should work with event listener options", () => {
    const handler = vi.fn();
    const options = { once: true };

    on(element, "click", handler, options);

    element.click();
    element.click();

    expect(handler).toHaveBeenCalledTimes(1); // Should only be called once due to 'once' option
  });
});

describe("element on method", () => {
  it("should provide on method on created elements", () => {
    const div = makeEl("div");
    const handler = vi.fn();

    expect("on" in div).toBe(true);

    // TypeScript should infer the correct types
    const cleanup = (div as SeidrElement).on("click", handler);

    expect(typeof cleanup).toBe("function");

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("$ (query selector)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should find element by query", () => {
    const testDiv = document.createElement("div");
    testDiv.id = "test-element";
    document.body.appendChild(testDiv);

    const found = $("div#test-element");

    expect(found).toBe(testDiv);
    expect(found?.id).toBe("test-element");
  });

  it("should return null when element not found", () => {
    const found = $(".non-existent");

    expect(found).toBeNull();
  });

  it("should search within specified element", () => {
    const container = document.createElement("div");
    const inner = document.createElement("span");
    inner.className = "inner";

    container.appendChild(inner);
    document.body.appendChild(container);

    const found = $(".inner", container);

    expect(found).toBe(inner);
  });

  it("should use document.body as default search scope", () => {
    const testDiv = document.createElement("div");
    testDiv.className = "body-element";
    document.body.appendChild(testDiv);

    const found = $(".body-element");

    expect(found).toBe(testDiv);
  });
});

describe("$$ (query selector all)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should find all matching elements", () => {
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const span = document.createElement("span");

    div1.className = "item";
    div2.className = "item";
    span.className = "item";

    document.body.appendChild(div1);
    document.body.appendChild(div2);
    document.body.appendChild(span);

    const found = $$(".item");

    expect(found.length).toBe(3);
    expect(found).toContain(div1);
    expect(found).toContain(div2);
    expect(found).toContain(span);
  });

  it("should return empty array when no elements found", () => {
    const found = $$(".non-existent");

    expect(found).toEqual([]);
  });

  it("should search within specified element", () => {
    const container = document.createElement("div");
    const inner1 = document.createElement("span");
    const inner2 = document.createElement("span");
    const outer = document.createElement("span");

    inner1.className = "inner-item";
    inner2.className = "inner-item";
    outer.className = "inner-item";

    container.appendChild(inner1);
    container.appendChild(inner2);
    document.body.appendChild(container);
    document.body.appendChild(outer);

    const found = $$(".inner-item", container);

    expect(found.length).toBe(2);
    expect(found).toContain(inner1);
    expect(found).toContain(inner2);
    expect(found).not.toContain(outer);
  });
});

describe("predefined element creators", () => {
  it("should create elements with correct types", () => {
    const div = DivEl({ className: "container" });
    const button = ButtonEl({ textContent: "Click" });
    const input = InputEl({ type: "text" });
    const span = SpanEl({ textContent: "Hello" });
    const anchor = AEl({ href: "#", textContent: "Link" });

    expect(div.tagName).toBe("DIV");
    expect(div.className).toBe("container");

    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toBe("Click");

    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("text");

    expect(span.tagName).toBe("SPAN");
    expect(span.textContent).toBe("Hello");

    expect(anchor.tagName).toBe("A");
    expect(anchor.href).toContain("#");
    expect(anchor.textContent).toBe("Link");
  });

  it("should support children arrays", () => {
    const text1 = TextNode("Hello ");
    const text2 = TextNode("World");
    const span = SpanEl({}, [text1, text2]);

    expect(span.textContent).toBe("Hello World");
  });

  it("should maintain the on method on predefined creators", () => {
    const button = ButtonEl({ textContent: "Click me" });
    const handler = vi.fn();

    expect("on" in button).toBe(true);

    const cleanup = (button as SeidrElement).on("click", handler);

    button.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();
  });
});

describe("TextNode", () => {
  it("should create text node with given text", () => {
    const textNode = TextNode("Hello World");

    expect(textNode.nodeType).toBe(3); // TEXT_NODE
    expect(textNode.textContent).toBe("Hello World");
  });

  it("should work with empty string", () => {
    const textNode = TextNode("");

    expect(textNode.textContent).toBe("");
  });

  it("should work with special characters", () => {
    const textNode = TextNode("Hello & <World>");

    expect(textNode.textContent).toBe("Hello & <World>");
  });
});

describe("integration tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should create complex DOM structures", () => {
    const form = makeEl("form", { id: "contact-form" }, [
      makeEl("div", { className: "form-group" }, [
        makeEl("label", { htmlFor: "name", textContent: "Name:" }),
        InputEl({ type: "text", id: "name", name: "name" }),
      ]),
      makeEl("div", { className: "form-group" }, [
        makeEl("label", { htmlFor: "email", textContent: "Email:" }),
        InputEl({ type: "email", id: "email", name: "email" }),
      ]),
      makeEl("div", { className: "form-group" }, [ButtonEl({ type: "submit", textContent: "Submit" })]),
    ]);

    document.body.appendChild(form);

    expect($("form#contact-form")).toBe(form);
    expect($("input#name")).toBeTruthy();
    expect($("input#email")).toBeTruthy();
    expect($('button[type="submit"]')).toBeTruthy();

    const nameLabel = $('label[for="name"]'); // Use 'for' instead of 'htmlFor' in CSS selector
    expect(nameLabel).toBeTruthy();
    expect(nameLabel?.textContent).toBe("Name:");
  });

  it("should handle event listeners in complex structures", () => {
    let clickCount = 0;

    const container = DivEl({ className: "container" }, [
      ButtonEl({
        className: "increment-btn",
        textContent: "Increment",
      }),
      SpanEl({
        className: "counter",
        textContent: "Count: 0",
      }),
    ]);

    document.body.appendChild(container);

    const button = $(".increment-btn") as HTMLButtonElement;
    const span = $(".counter") as HTMLSpanElement;

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

describe("ReactiveProps - ObservableValue bindings", () => {
  describe("string observable bindings", () => {
    it("should update textContent when ObservableValue<string> changes", () => {
      const text = new ObservableValue("initial");
      const span = SpanEl({ textContent: text });

      expect(span.textContent).toBe("initial");

      text.value = "updated";
      expect(span.textContent).toBe("updated");

      text.value = "final update";
      expect(span.textContent).toBe("final update");
    });

    it("should update className when ObservableValue<string> changes", () => {
      const className = new ObservableValue("initial-class");
      const div = DivEl({ className });

      expect(div.className).toBe("initial-class");

      className.value = "updated-class";
      expect(div.className).toBe("updated-class");
    });

    it("should update id when ObservableValue<string> changes", () => {
      const id = new ObservableValue("element-1");
      const button = ButtonEl({ id });

      expect(button.id).toBe("element-1");

      id.value = "element-2";
      expect(button.id).toBe("element-2");
    });

    it("should update href when ObservableValue<string> changes", () => {
      const href = new ObservableValue("/initial-path");
      const link = AEl({ href });

      expect(link.href).toContain("/initial-path");

      href.value = "/updated-path";
      expect(link.href).toContain("/updated-path");
    });

    it("should update input placeholder when ObservableValue<string> changes", () => {
      const placeholder = new ObservableValue("Enter name");
      const input = InputEl({ type: "text", placeholder });

      expect(input.placeholder).toBe("Enter name");

      placeholder.value = "Enter your name";
      expect(input.placeholder).toBe("Enter your name");
    });

    it("should update input value when ObservableValue<string> changes", () => {
      const value = new ObservableValue("initial value");
      const input = InputEl({ type: "text", value });

      expect(input.value).toBe("initial value");

      value.value = "updated value";
      expect(input.value).toBe("updated value");
    });
  });

  describe("boolean observable bindings", () => {
    it("should update disabled when ObservableValue<boolean> changes", () => {
      const disabled = new ObservableValue(false);
      const button = ButtonEl({ disabled });

      expect(button.disabled).toBe(false);

      disabled.value = true;
      expect(button.disabled).toBe(true);

      disabled.value = false;
      expect(button.disabled).toBe(false);
    });

    it("should update hidden when ObservableValue<boolean> changes", () => {
      const hidden = new ObservableValue(false);
      const div = DivEl({ hidden });

      expect(div.hidden).toBe(false);

      hidden.value = true;
      expect(div.hidden).toBe(true);

      hidden.value = false;
      expect(div.hidden).toBe(false);
    });

    it("should update input readonly when ObservableValue<boolean> changes", () => {
      const readonly = new ObservableValue(false);
      const input = InputEl({ type: "text", readOnly: readonly }); // Note: readOnly, not readonly

      expect(input.readOnly).toBe(false);

      readonly.value = true;
      expect(input.readOnly).toBe(true);

      readonly.value = false;
      expect(input.readOnly).toBe(false);
    });

    it("should update input required when ObservableValue<boolean> changes", () => {
      const required = new ObservableValue(false);
      const input = InputEl({ type: "text", required });

      expect(input.required).toBe(false);

      required.value = true;
      expect(input.required).toBe(true);

      required.value = false;
      expect(input.required).toBe(false);
    });
  });

  describe("number observable bindings", () => {
    it("should update tabIndex when ObservableValue<number> changes", () => {
      const tabIndex = new ObservableValue(1);
      const button = ButtonEl({ tabIndex });

      expect(button.tabIndex).toBe(1);

      tabIndex.value = -1;
      expect(button.tabIndex).toBe(-1);

      tabIndex.value = 0;
      expect(button.tabIndex).toBe(0);
    });

    it("should update input maxLength when ObservableValue<number> changes", () => {
      const maxLength = new ObservableValue(10);
      const input = InputEl({ type: "text", maxLength });

      expect(input.maxLength).toBe(10);

      maxLength.value = 20;
      expect(input.maxLength).toBe(20);

      maxLength.value = 50;
      expect(input.maxLength).toBe(50);
    });

    it("should update input size when ObservableValue<number> changes", () => {
      const size = new ObservableValue(20);
      const input = InputEl({ type: "text", size });

      expect(input.size).toBe(20);

      size.value = 30;
      expect(input.size).toBe(30);
    });

    it("should update textarea cols when ObservableValue<number> changes", () => {
      const cols = new ObservableValue(40);
      const textarea = makeEl("textarea", { cols });

      expect(textarea.cols).toBe(40);

      cols.value = 60;
      expect(textarea.cols).toBe(60);
    });
  });

  describe("mixed static and reactive properties", () => {
    it("should handle static and reactive properties together", () => {
      const className = new ObservableValue("dynamic-class");
      const button = ButtonEl({
        id: "static-id",
        className,
        type: "button",
        disabled: false
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
      const className = new ObservableValue("class1");
      const disabled = new ObservableValue(false);
      const tabIndex = new ObservableValue(1);

      const button = ButtonEl({
        className,
        disabled,
        tabIndex,
        textContent: "Test Button"
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
      const className = new ObservableValue("initial");
      const div = DivEl({ className });

      expect(div.className).toBe("initial");

      // Update to verify it's working
      className.value = "updated";
      expect(div.className).toBe("updated");

      // Destroy the element
      div.destroy();

      // Update the observable again
      className.value = "should-not-update";

      // The DOM element should not have been updated
      expect(div.className).toBe("updated");
    });

    it("should cleanup all reactive bindings on element destroy", () => {
      const className = new ObservableValue("class1");
      const disabled = new ObservableValue(false);
      const tabIndex = new ObservableValue(1);

      const button = ButtonEl({
        className,
        disabled,
        tabIndex
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
      button.destroy();

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
      const childText = new ObservableValue("child");
      const parentClass = new ObservableValue("parent");

      const child = SpanEl({ textContent: childText });
      const parent = DivEl({ className: parentClass }, [child]);

      expect(child.textContent).toBe("child");
      expect(parent.className).toBe("parent");

      // Update to verify bindings work
      childText.value = "updated child";
      parentClass.value = "updated parent";

      expect(child.textContent).toBe("updated child");
      expect(parent.className).toBe("updated parent");

      // Destroy parent (should also destroy child)
      parent.destroy();

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
      const text = new ObservableValue("initial");
      const span = SpanEl({ textContent: text });

      expect(span.textContent).toBe("initial");

      // Rapid updates
      text.value = "update1";
      text.value = "update2";
      text.value = "update3";
      text.value = "final";

      expect(span.textContent).toBe("final");
    });

    it("should handle null and undefined values for string observables", () => {
      const text = new ObservableValue<string | null>("initial");
      const span = SpanEl({ textContent: text });

      expect(span.textContent).toBe("initial");

      text.value = null;
      expect(span.textContent).toBe(""); // DOM converts null to empty string

      text.value = undefined;
      expect(span.textContent).toBe(""); // DOM converts undefined to empty string

      text.value = "back to string";
      expect(span.textContent).toBe("back to string");
    });

    it("should handle zero values for number observables", () => {
      const tabIndex = new ObservableValue(5);
      const button = ButtonEl({ tabIndex });

      expect(button.tabIndex).toBe(5);

      tabIndex.value = 0;
      expect(button.tabIndex).toBe(0);

      tabIndex.value = -1;
      expect(button.tabIndex).toBe(-1);
    });

    it("should handle ObservableValue with same value updates efficiently", () => {
      const text = new ObservableValue("initial");
      const span = SpanEl({ textContent: text });

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
