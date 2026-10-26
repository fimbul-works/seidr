import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Collapsible, createCollapsible } from "./index.js";

const TRIGGER_TEXT = "Toggle Trigger";
const CONTENT_TEXT = "Collapsible Content Area";

describeDualMode("Collapsible", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => HTMLElement) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render collapsed by default with correct aria attributes", () => {
    const root = setup(() =>
      Collapsible({
        trigger: TRIGGER_TEXT,
        children: CONTENT_TEXT,
      }),
    );

    const trigger = root.querySelector("button")!;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toBe(TRIGGER_TEXT);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("data-closed")).toBe(true);
    expect(trigger.hasAttribute("data-expanded")).toBe(false);

    // Content should not be in the DOM by default when closed
    const content = root.querySelector("[data-expanded]");
    expect(content).toBeNull();
  });

  it("should support defaultOpen: true", () => {
    const root = setup(() =>
      Collapsible({
        defaultOpen: true,
        trigger: TRIGGER_TEXT,
        children: CONTENT_TEXT,
      }),
    );

    const trigger = root.querySelector("button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.hasAttribute("data-expanded")).toBe(true);

    const content = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === CONTENT_TEXT);
    expect(content).toBeDefined();
    expect(content?.hasAttribute("data-expanded")).toBe(true);
    expect(trigger.getAttribute("aria-controls")).toBe(content?.id);
  });

  it("should support pre-bound instance factory Collapsible.create", () => {
    const root = setup(() => {
      const col = Collapsible.create({ defaultOpen: true });
      return col.Root([
        col.Trigger(TRIGGER_TEXT),
        col.Content(CONTENT_TEXT),
      ]);
    });

    const trigger = root.querySelector("button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const content = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === CONTENT_TEXT);
    expect(content).toBeDefined();
    expect(trigger.getAttribute("aria-controls")).toBe(content?.id);
  });

  it("should support forceMount keeping content in DOM with hidden attribute when closed", () => {
    const root = setup(() =>
      Collapsible({
        forceMount: true,
        defaultOpen: false,
        trigger: TRIGGER_TEXT,
        children: CONTENT_TEXT,
      }),
    );

    const content = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === CONTENT_TEXT);
    expect(content).toBeDefined();
    expect(content?.hasAttribute("hidden")).toBe(true);
    expect(content?.hasAttribute("data-closed")).toBe(true);
  });

  if (!isSSR) {
    it("should toggle open and close when clicking the trigger", () => {
      const onOpenChange = vi.fn();
      const root = setup(() =>
        Collapsible({
          onOpenChange,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      const trigger = root.querySelector("button")!;
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(root.textContent).not.toContain(CONTENT_TEXT);

      // Open
      trigger.click();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(trigger.hasAttribute("data-expanded")).toBe(true);
      expect(trigger.hasAttribute("data-closed")).toBe(false);
      expect(root.textContent).toContain(CONTENT_TEXT);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      // Close
      trigger.click();
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(trigger.hasAttribute("data-closed")).toBe(true);
      expect(trigger.hasAttribute("data-expanded")).toBe(false);
      expect(root.textContent).not.toContain(CONTENT_TEXT);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should not open when disabled", () => {
      const onOpenChange = vi.fn();
      const root = setup(() =>
        Collapsible({
          disabled: true,
          onOpenChange,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      const trigger = root.querySelector("button")!;
      expect(trigger.hasAttribute("disabled")).toBe(true);
      expect(trigger.hasAttribute("data-disabled")).toBe(true);

      trigger.click();
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(root.textContent).not.toContain(CONTENT_TEXT);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("should support controlled reactive Value<boolean>", () => {
      const open = createValue(false);
      const onOpenChange = vi.fn((val: boolean) => open(val));
      const root = setup(() =>
        Collapsible({
          open,
          onOpenChange,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      const trigger = root.querySelector("button")!;
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      trigger.click();
      expect(open()).toBe(true);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(root.textContent).toContain(CONTENT_TEXT);

      open(false);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(root.textContent).not.toContain(CONTENT_TEXT);
    });

    it("should not close content when clicking the trigger and collapsible is open controlled (literal)", () => {
      const onOpenChange = vi.fn();
      const root = setup(() =>
        Collapsible({
          open: true,
          onOpenChange,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      const trigger = root.querySelector("button")!;
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(root.textContent).toContain(CONTENT_TEXT);

      trigger.click();
      // In controlled static mode, content stays open, but onOpenChange was notified
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(root.textContent).toContain(CONTENT_TEXT);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should toggle hidden attribute when forceMount is used", () => {
      const root = setup(() =>
        Collapsible({
          forceMount: true,
          defaultOpen: false,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      const trigger = root.querySelector("button")!;
      const content = Array.from(root.querySelectorAll("div")).find((el) => el.textContent === CONTENT_TEXT)!;
      expect(content.hasAttribute("hidden")).toBe(true);

      trigger.click();
      expect(content.hasAttribute("hidden")).toBe(false);
      expect(content.hasAttribute("data-expanded")).toBe(true);

      trigger.click();
      expect(content.hasAttribute("hidden")).toBe(true);
      expect(content.hasAttribute("data-closed")).toBe(true);
    });

    it("should pass axe accessibility checks", async () => {
      const root = setup(() =>
        Collapsible({
          id: "accessible-collapsible",
          defaultOpen: true,
          trigger: TRIGGER_TEXT,
          children: CONTENT_TEXT,
        }),
      );

      // @ts-expect-error vitest-axe types
      expect(await axe(root)).toHaveNoViolations();
    });
  }
});
