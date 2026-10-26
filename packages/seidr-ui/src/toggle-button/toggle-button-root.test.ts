import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ToggleButton, ToggleButtonRoot } from "./toggle-button-root.js";

describeDualMode("ToggleButton", ({ getDocument, isSSR }) => {
  let container: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    container?.remove();
  });

  it("should render a button with aria-pressed='false' by default", () => {
    container = ToggleButton("Mute");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("button");
    expect(container.getAttribute("aria-pressed")).toBe("false");
    expect(container.hasAttribute("data-pressed")).toBe(false);
    expect(container.textContent).toBe("Mute");
  });

  it("should support ToggleButton.Root namespace alias", () => {
    container = ToggleButtonRoot("Toggle alias");
    getDocument().body.appendChild(container);

    expect(container.getAttribute("aria-pressed")).toBe("false");
  });

  it("should support defaultPressed: true", () => {
    container = ToggleButton({ defaultPressed: true }, "Active");
    getDocument().body.appendChild(container);

    expect(container.getAttribute("aria-pressed")).toBe("true");
    expect(container.hasAttribute("data-pressed")).toBe(true);
  });

  it("should support renderContent prop with reactive state", () => {
    const App = createComponent(() =>
      ToggleButton({
        defaultPressed: true,
        renderContent: ({ pressed }) => pressed.as((p: boolean) => (p ? "Muted" : "Unmuted")),
      }),
    );

    const target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    unmount = mount(App, target);

    const btn = target.querySelector("button")!;
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.textContent).toBe("Muted");
  });

  it("should allow passing a reactive derived Value directly as children without collision", () => {
    const isStarred = createValue(true);
    container = ToggleButton(
      { pressed: isStarred, onChange: (v) => isStarred(v) },
      isStarred.as((s) => (s ? "⭐ Starred" : "☆ Star")),
    );
    getDocument().body.appendChild(container);

    expect(container.textContent).toBe("⭐ Starred");
    expect(container.getAttribute("aria-pressed")).toBe("true");
  });

  if (!isSSR) {
    it("should toggle state on click and call onChange", () => {
      const onChange = vi.fn();
      container = ToggleButton({ onChange }, "Toggle");
      getDocument().body.appendChild(container);

      expect(container.getAttribute("aria-pressed")).toBe("false");

      container.click();
      expect(container.getAttribute("aria-pressed")).toBe("true");
      expect(container.hasAttribute("data-pressed")).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true, false);

      container.click();
      expect(container.getAttribute("aria-pressed")).toBe("false");
      expect(container.hasAttribute("data-pressed")).toBe(false);
      expect(onChange).toHaveBeenCalledWith(false, true);
    });

    it("should support controlled pressed state", () => {
      const pressed = createValue(false);
      const onChange = vi.fn((val: boolean) => pressed(val));
      container = ToggleButton({ pressed, onChange }, "Controlled");
      getDocument().body.appendChild(container);

      expect(container.getAttribute("aria-pressed")).toBe("false");

      container.click();
      expect(onChange).toHaveBeenCalledWith(true, false);
      expect(container.getAttribute("aria-pressed")).toBe("true");

      pressed(false);
      expect(container.getAttribute("aria-pressed")).toBe("false");
    });

    it("should not toggle when disabled", () => {
      const onChange = vi.fn();
      container = ToggleButton({ disabled: true, onChange }, "Disabled toggle");
      getDocument().body.appendChild(container);

      container.click();
      expect(container.getAttribute("aria-pressed")).toBe("false");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should support rendering as custom element and toggle with keyboard", () => {
      const onChange = vi.fn();
      container = ToggleButton({ as: "div", onChange }, "Custom div toggle");
      getDocument().body.appendChild(container);

      expect(container.tagName.toLowerCase()).toBe("div");
      expect(container.getAttribute("role")).toBe("button");
      expect(container.getAttribute("aria-pressed")).toBe("false");

      // Enter keydown
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      container.dispatchEvent(enterEvent);
      expect(onChange).toHaveBeenCalledWith(true, false);
      expect(container.getAttribute("aria-pressed")).toBe("true");
    });

    it("should have no accessibility violations", async () => {
      container = ToggleButton({ id: "accessible-toggle" }, "Accessible Toggle");
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
