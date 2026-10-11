import { createComponent, createValue, mount, SeidrError } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEscapeKeyDown, useEscapeKeydown } from "./use-escape-keydown.js";

describe("useEscapeKeydown validation", () => {
  it("throws SeidrError when onEscapeKeyDown is an invalid type", () => {
    expect(() => useEscapeKeydown(123 as any)).toThrow(SeidrError);
    expect(() => useEscapeKeydown("string" as any)).toThrow(SeidrError);
    expect(() => useEscapeKeydown(true as any)).toThrow(SeidrError);
    expect(() => useEscapeKeydown({} as any)).toThrow(SeidrError);
  });

  it("throws SeidrError when ownerDocument is not an event target", () => {
    expect(() => useEscapeKeydown(() => {}, 123 as any)).toThrow(SeidrError);
    expect(() => useEscapeKeydown(() => {}, "doc" as any)).toThrow(SeidrError);
    expect(() => useEscapeKeydown(() => {}, {} as any)).toThrow(SeidrError);
  });

  it("allows functions and Values", () => {
    expect(() => useEscapeKeydown(() => {})).not.toThrow();
    expect(() => useEscapeKeydown(createValue(() => {}))).not.toThrow();
    expect(() => useEscapeKeydown(() => {}, null)).not.toThrow();
    expect(() => useEscapeKeydown(() => {}, createValue<Document | null>(null))).not.toThrow();
  });

  it("exports useEscapeKeyDown alias identically", () => {
    expect(useEscapeKeyDown).toBe(useEscapeKeydown);
  });
});

describe("useEscapeKeydown behavior (client)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it("attaches listener on mount and invokes callback when Escape is pressed", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeydown(handleEscape);
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
      useEscapeKeydown(handleEscape);
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
      useEscapeKeydown(handleEscape);
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

  it("registers listener with capture phase", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const Modal = createComponent(() => {
      useEscapeKeydown(() => {});
      return $div();
    });

    const unmount = mount(Modal, container);

    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });

    unmount();
  });

  it("removes event listener when component unmounts", () => {
    const handleEscape = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const Modal = createComponent(() => {
      useEscapeKeydown(handleEscape);
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });

    // Subsequent escape events should NOT call handleEscape
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it("allows manual cleanup before unmount", () => {
    const handleEscape = vi.fn();
    let cleanupFn!: () => void;

    const Modal = createComponent(() => {
      cleanupFn = useEscapeKeydown(handleEscape);
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // Call manual cleanup
    cleanupFn();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // Later unmount does not throw or double-clean
    expect(() => unmount()).not.toThrow();
  });

  it("prevents listener attachment when cleanup is called before mount", () => {
    const handleEscape = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const Modal = createComponent(() => {
      const cleanup = useEscapeKeydown(handleEscape);
      // Clean up immediately during component setup
      cleanup();
      return $div();
    });

    const unmount = mount(Modal, container);

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).not.toHaveBeenCalled();

    unmount();
  });

  it("cleanup is idempotent and safe when called multiple times", () => {
    const handleEscape = vi.fn();
    let cleanupFn!: () => void;

    const Modal = createComponent(() => {
      cleanupFn = useEscapeKeydown(handleEscape);
      return $div();
    });

    const unmount = mount(Modal, container);

    cleanupFn();
    expect(() => cleanupFn()).not.toThrow();
    expect(() => cleanupFn()).not.toThrow();

    unmount();
  });

  it("supports custom ownerDocument", () => {
    const customDoc = document.implementation.createHTMLDocument("Custom");
    const handleEscape = vi.fn();

    const Modal = createComponent(() => {
      useEscapeKeydown(handleEscape, customDoc);
      return $div();
    });

    const unmount = mount(Modal, container);

    // Dispatching on global document does NOT trigger handleEscape
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).not.toHaveBeenCalled();

    // Dispatching on customDoc triggers handleEscape
    customDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    unmount();

    // After unmount, customDoc listener is removed
    customDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it("supports reactive Value for onEscapeKeyDown callback", () => {
    const callbackA = vi.fn();
    const callbackB = vi.fn();
    const currentCallback = createValue<((event: KeyboardEvent) => void) | undefined>(callbackA);

    const Modal = createComponent(() => {
      useEscapeKeydown(currentCallback);
      return $div();
    });

    const unmount = mount(Modal, container);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).not.toHaveBeenCalled();

    // Switch callback
    currentCallback(() => callbackB);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(1);

    // Set callback to undefined
    currentCallback(undefined);
    expect(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    }).not.toThrow();

    unmount();
  });

  it("supports reactive Value for ownerDocument", () => {
    const docA = document.implementation.createHTMLDocument("DocA");
    const docB = document.implementation.createHTMLDocument("DocB");
    const currentDoc = createValue<Document | null>(docA);
    const handleEscape = vi.fn();

    const Modal = createComponent(() => {
      useEscapeKeydown(handleEscape, currentDoc);
      return $div();
    });

    const unmount = mount(Modal, container);

    docA.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // Switch document
    currentDoc(docB);

    // docA is now detached
    docA.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // docB is now attached
    docB.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(2);

    // Switch to null
    currentDoc(null);
    docB.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(2);

    unmount();
  });

  it("dynamically attaches and detaches listeners when a Value switches between callback and undefined", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const handleEscape = vi.fn();

    // Starts as undefined -> should NOT attach listener on mount
    const onEscape = createValue<((e: KeyboardEvent) => void) | undefined>(undefined);

    const Modal = createComponent(() => {
      useEscapeKeydown(onEscape);
      return $div();
    });

    const unmount = mount(Modal, container);

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    // Update Value to a handler function -> listener should now be attached
    onEscape(() => handleEscape);
    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1);

    // Update Value back to undefined -> listener should now be detached
    onEscape(undefined);
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(handleEscape).toHaveBeenCalledTimes(1); // Not called again

    unmount();
  });
});

describeDualMode("useEscapeKeydown DualMode (SSR and Client safety)", ({ isSSR }) => {
  it("does not throw or attach window listeners during SSR execution", () => {
    const handleEscape = vi.fn();
    const Modal = createComponent(() => {
      useEscapeKeydown(handleEscape);
      return $div({}, "Modal Content");
    });

    // In SSR, mounting or rendering should not throw
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
