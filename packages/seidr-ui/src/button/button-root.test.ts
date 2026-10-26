import { createValue } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Button, ButtonRoot } from "./button-root.js";

describeDualMode("Button", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  it("should render a button with type='button' by default", () => {
    container = Button("Click me");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("button");
    expect(container.getAttribute("type")).toBe("button");
    expect(container.textContent).toBe("Click me");
  });

  it("should support Button.Root namespace alias", () => {
    container = ButtonRoot("Namespace button");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("button");
    expect(container.textContent).toBe("Namespace button");
  });

  it("should support custom button types", () => {
    container = Button({ type: "submit" }, "Submit");
    getDocument().body.appendChild(container);

    expect(container.getAttribute("type")).toBe("submit");
  });

  it("should handle static disabled on native button", () => {
    container = Button({ disabled: true }, "Disabled button");
    getDocument().body.appendChild(container);

    expect((container as HTMLButtonElement).disabled).toBe(true);
    expect(container.hasAttribute("data-disabled")).toBe(true);
  });

  it("should handle reactive disabled on native button", () => {
    const disabled = createValue(false);
    container = Button({ disabled }, "Toggleable button");
    getDocument().body.appendChild(container);

    expect((container as HTMLButtonElement).disabled).toBe(false);
    expect(container.hasAttribute("data-disabled")).toBe(false);

    disabled(true);
    expect((container as HTMLButtonElement).disabled).toBe(true);
    expect(container.hasAttribute("data-disabled")).toBe(true);
  });

  it("should support rendering as a custom non-button element", () => {
    container = Button({ as: "div" }, "Div button");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("button");
    expect(container.tabIndex).toBe(0);
    expect(container.getAttribute("type")).toBeNull();
  });

  it("should handle disabled on non-button elements", () => {
    container = Button({ as: "div", disabled: true }, "Disabled div button");
    getDocument().body.appendChild(container);

    expect(container.getAttribute("role")).toBe("button");
    expect(container.getAttribute("aria-disabled")).toBe("true");
    expect(container.hasAttribute("data-disabled")).toBe(true);
    expect(container.getAttribute("tabindex")).toBeNull();
  });

  if (!isSSR) {
    it("should trigger onclick when clicked and enabled", () => {
      const clickHandler = vi.fn();
      container = Button({ onclick: clickHandler }, "Action");
      getDocument().body.appendChild(container);

      container.click();
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it("should suppress onclick when disabled", () => {
      const clickHandler = vi.fn();
      container = Button({ disabled: true, onclick: clickHandler }, "Blocked");
      getDocument().body.appendChild(container);

      container.click();
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it("should trigger click on Enter and Space keys for non-button element", () => {
      const clickHandler = vi.fn();
      container = Button({ as: "div", onclick: clickHandler }, "Div key test");
      getDocument().body.appendChild(container);

      // Enter keydown
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      container.dispatchEvent(enterEvent);
      expect(clickHandler).toHaveBeenCalledTimes(1);

      // Space keyup
      const spaceDown = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
      container.dispatchEvent(spaceDown);
      const spaceUp = new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
      container.dispatchEvent(spaceUp);
      expect(clickHandler).toHaveBeenCalledTimes(2);
    });

    it("should have no accessibility violations", async () => {
      container = Button({ id: "accessible-btn" }, "Accessible Button");
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });

    it("should have no accessibility violations when rendered as div", async () => {
      container = Button({ as: "div", id: "accessible-div-btn" }, "Custom Div Button");
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
