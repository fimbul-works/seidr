import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEscapeKeyDown, useEscapeKeydown } from "./use-escape-keydown.js";

describe("useEscapeKeydown", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it("exports useEscapeKeyDown alias identically", () => {
    expect(useEscapeKeyDown).toBe(useEscapeKeydown);
  });

  it("attaches listener on mount and invokes callback when Escape is pressed", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeyDown({ onEscapeKeyDown: handleEscape });
      return $div();
    });

    const unmount = mount(Modal, container);

    expect(handleEscape).not.toHaveBeenCalled();

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(handleEscape).toHaveBeenCalledTimes(1);
    expect(handleEscape).toHaveBeenCalledWith(escapeEvent);

    unmount();
  });

  it("invokes callback when legacy 'Esc' key is pressed", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeyDown({ onEscapeKeyDown: handleEscape });
      return $div();
    });

    const unmount = mount(Modal, container);

    const escEvent = new KeyboardEvent("keydown", { key: "Esc", bubbles: true });
    document.dispatchEvent(escEvent);

    expect(handleEscape).toHaveBeenCalledTimes(1);
    expect(handleEscape).toHaveBeenCalledWith(escEvent);

    unmount();
  });

  it("ignores non-Escape keys", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeyDown({ onEscapeKeyDown: handleEscape });
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Space", bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

    expect(handleEscape).not.toHaveBeenCalled();

    unmount();
  });

  it("registers keydown listener on document and removes on unmount", () => {
    const handleEscape = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const Modal = createComponent(() => {
      useEscapeKeyDown({ onEscapeKeyDown: handleEscape });
      return $div();
    });

    const unmount = mount(Modal, container);

    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it("supports custom ownerDocument", () => {
    const customDoc = document.implementation.createHTMLDocument("Custom");
    const handleEscape = vi.fn();

    const Modal = createComponent(() => {
      useEscapeKeyDown({
        onEscapeKeyDown: handleEscape,
        ownerDocument: customDoc,
      });
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).not.toHaveBeenCalled();

    customDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    unmount();

    customDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it("supports reactive isDisabled Value", () => {
    const handleEscape = vi.fn();
    const isDisabled = createValue(true);

    const Modal = createComponent(() => {
      useEscapeKeyDown({
        isDisabled,
        onEscapeKeyDown: handleEscape,
      });
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).not.toHaveBeenCalled();

    // Enable
    isDisabled(false);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // Disable again
    isDisabled(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    unmount();
  });
});

describeDualMode("useEscapeKeydown DualMode (SSR and Client safety)", ({ isSSR }) => {
  it("does not throw or attach window listeners during SSR execution", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeydown({ onEscapeKeyDown: handleEscape });
      return $div({}, "Modal Content");
    });

    expect(() => {
      const comp = Modal();
      if (!isSSR) {
        comp.mount();
      }
      comp.unmount();
    }).not.toThrow();

    if (isSSR) {
      expect(handleEscape).not.toHaveBeenCalled();
    }
  });
});
