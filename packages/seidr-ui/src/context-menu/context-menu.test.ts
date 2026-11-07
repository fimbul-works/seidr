import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import {
  ContextMenu,
  type ContextMenuItemDescriptor,
  createContextMenu,
} from "./index.js";

describeDualMode("ContextMenu", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render default structure, roles, and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      ContextMenu({
        id: "test-contextmenu",
        trigger: "Right click here",
        items: [
          { value: "copy", label: "Copy" },
          { value: "paste", label: "Paste" },
          { value: "delete", label: "Delete", disabled: true },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("context-menu");

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName.toLowerCase()).toBe("div");
    expect(triggerEl.getAttribute("data-component")).toBe("context-menu");
    expect(triggerEl.getAttribute("data-state")).toBe("closed");
    expect(triggerEl.textContent).toBe("Right click here");

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports fine-grained composition via createContextMenu (Tier 2)", () => {
    const onReload = vi.fn();

    const root = setup(() => {
      const cm = createContextMenu({ id: "custom-cm", defaultOpen: true });

      return cm.Root({}, [
        cm.Trigger({}, "Context Area"),
        cm.Content({}, [
          cm.Item({ value: "reload", onSelect: onReload }, [
            cm.Icon({}, "🔄"),
            cm.ItemLabel({}, "Reload"),
            cm.ItemDescription({}, "Refresh this page"),
          ]),
          cm.Separator(),
          cm.CheckboxItem({ value: "inspect", defaultChecked: true }, [
            cm.ItemIndicator({}, "✓"),
            cm.ItemLabel({}, "Inspect Element"),
          ]),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.textContent).toBe("Context Area");
    expect(triggerEl.getAttribute("data-state")).toBe("open");

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("menu");
    expect(contentEl.getAttribute("data-component")).toBe("context-menu");

    const itemEl = root.querySelector("[data-part='item']") as HTMLElement;
    expect(itemEl).not.toBeNull();
    expect(itemEl.getAttribute("role")).toBe("menuitem");
    expect(itemEl.getAttribute("data-component")).toBe("context-menu");

    const separatorEl = root.querySelector("[data-part='separator']") as HTMLElement;
    expect(separatorEl).not.toBeNull();
    expect(separatorEl.getAttribute("role")).toBe("separator");
    expect(separatorEl.getAttribute("data-component")).toBe("context-menu");

    const checkboxEl = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkboxEl).not.toBeNull();
    expect(checkboxEl.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkboxEl.getAttribute("data-component")).toBe("context-menu");
    expect(checkboxEl.getAttribute("aria-checked")).toBe("true");
  });

  it("opens context menu and captures client coordinates on right-click", () => {
    if (isSSR) return;

    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "right-click-cm" });

      return cmInstance.Root({}, [
        cmInstance.Trigger({}, "Right Click Target"),
        cmInstance.Content({}, [
          cmInstance.Item({ value: "item1" }, "Option 1"),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(root.querySelector("[data-part='content']")).toBeNull();

    const mouseEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 150,
      clientY: 275,
    });

    triggerEl.dispatchEvent(mouseEvent);

    expect(mouseEvent.defaultPrevented).toBe(true);
    expect(cmInstance.isOpen()).toBe(true);
    expect(cmInstance.anchorRect()).toEqual({
      x: 150,
      y: 275,
      width: 0,
      height: 0,
    });

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
  });

  it("opens context menu via touch long-press (700ms)", () => {
    if (isSSR) return;

    vi.useFakeTimers();
    try {
      let cmInstance!: ReturnType<typeof createContextMenu>;

      const root = setup(() => {
        cmInstance = createContextMenu({ id: "touch-cm" });

        return cmInstance.Root({}, [
          cmInstance.Trigger({}, "Touch Area"),
          cmInstance.Content({}, [
            cmInstance.Item({ value: "item1" }, "Touch Option"),
          ]),
        ]);
      });

      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(root.querySelector("[data-part='content']")).toBeNull();

      const pointerDownEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.assign(pointerDownEvent, {
        pointerType: "touch",
        clientX: 80,
        clientY: 120,
      });

      triggerEl.dispatchEvent(pointerDownEvent);

      // Menu should still be closed before 700ms
      vi.advanceTimersByTime(500);
      expect(cmInstance.isOpen()).toBe(false);

      // After 700ms, menu should open
      vi.advanceTimersByTime(200);
      expect(cmInstance.isOpen()).toBe(true);
      expect(cmInstance.anchorRect()).toEqual({
        x: 80,
        y: 120,
        width: 0,
        height: 0,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("cancels touch long-press if pointer moves or cancels before 700ms", () => {
    if (isSSR) return;

    vi.useFakeTimers();
    try {
      let cmInstance!: ReturnType<typeof createContextMenu>;

      const root = setup(() => {
        cmInstance = createContextMenu({ id: "touch-cancel-cm" });

        return cmInstance.Root({}, [
          cmInstance.Trigger({}, "Touch Area"),
          cmInstance.Content({}, [
            cmInstance.Item({ value: "item1" }, "Touch Option"),
          ]),
        ]);
      });

      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

      const pointerDownEvent = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.assign(pointerDownEvent, { pointerType: "touch", clientX: 50, clientY: 50 });
      triggerEl.dispatchEvent(pointerDownEvent);

      vi.advanceTimersByTime(300);

      const pointerMoveEvent = new Event("pointermove", { bubbles: true, cancelable: true });
      Object.assign(pointerMoveEvent, { pointerType: "touch" });
      triggerEl.dispatchEvent(pointerMoveEvent);

      vi.advanceTimersByTime(500);
      expect(cmInstance.isOpen()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not open context menu when trigger is disabled", () => {
    if (isSSR) return;

    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "disabled-cm" });

      return cmInstance.Root({}, [
        cmInstance.Trigger({ disabled: true }, "Disabled Area"),
        cmInstance.Content({}, [
          cmInstance.Item({ value: "item1" }, "Item"),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl.hasAttribute("data-disabled")).toBe(true);

    const mouseEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 50,
      clientY: 50,
    });

    triggerEl.dispatchEvent(mouseEvent);

    expect(mouseEvent.defaultPrevented).toBe(false);
    expect(cmInstance.isOpen()).toBe(false);
  });

  it("closes context menu on item selection", () => {
    if (isSSR) return;

    const onSelect = vi.fn();
    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "select-cm", defaultOpen: true });

      return cmInstance.Root({}, [
        cmInstance.Trigger({}, "Target"),
        cmInstance.Content({}, [
          cmInstance.Item({ value: "action", onSelect }, "Perform Action"),
        ]),
      ]);
    });

    expect(cmInstance.isOpen()).toBe(true);

    const itemEl = root.querySelector("[data-part='item']") as HTMLElement;
    itemEl.click();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(cmInstance.isOpen()).toBe(false);
  });

  it("closes context menu on Escape key press", () => {
    if (isSSR) return;

    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "escape-cm", defaultOpen: true });

      return cmInstance.Root({}, [
        cmInstance.Trigger({}, "Target"),
        cmInstance.Content({}, [
          cmInstance.Item({ value: "item1" }, "Option"),
        ]),
      ]);
    });

    expect(cmInstance.isOpen()).toBe(true);

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(cmInstance.isOpen()).toBe(false);
  });

  it("closes context menu on outside pointer interaction", async () => {
    if (isSSR) return;

    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "outside-cm", defaultOpen: true });

      return cmInstance.Root({}, [
        cmInstance.Trigger({}, "Target"),
        cmInstance.Content({}, [
          cmInstance.Item({ value: "item1" }, "Option"),
        ]),
      ]);
    });

    expect(cmInstance.isOpen()).toBe(true);

    // Allow useInteractOutside listener to be attached
    await new Promise((resolve) => setTimeout(resolve, 10));

    getDocument().body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));

    expect(cmInstance.isOpen()).toBe(false);
  });

  it("supports RadioGroup inside ContextMenu", () => {
    if (isSSR) return;

    const onChange = vi.fn();

    const root = setup(() => {
      const cm = createContextMenu({ id: "radio-cm", defaultOpen: true });
      const group = cm.createRadioGroup({ defaultValue: "dark", onChange });

      return cm.Root({}, [
        cm.Trigger({}, "Settings"),
        cm.Content({}, [
          group.Root({}, [
            group.Item({ value: "light" }, [
              cm.ItemIndicator({}, "•"),
              cm.ItemLabel({}, "Light"),
            ]),
            group.Item({ value: "dark" }, [
              cm.ItemIndicator({}, "•"),
              cm.ItemLabel({}, "Dark"),
            ]),
          ]),
        ]),
      ]);
    });

    const radioItems = root.querySelectorAll("[data-part='radio-item']");
    expect(radioItems.length).toBe(2);
    expect(radioItems[1].getAttribute("aria-checked")).toBe("true");

    (radioItems[0] as HTMLElement).click();
    expect(onChange).toHaveBeenCalledWith("light");
    expect(radioItems[0].getAttribute("aria-checked")).toBe("true");
    expect(radioItems[1].getAttribute("aria-checked")).toBe("false");
  });

  it("supports nested Submenus in ContextMenu", () => {
    const onNested = vi.fn();

    const root = setup(() => {
      const parent = createContextMenu({ id: "parent-cm", defaultOpen: true });
      const sub = parent.createSub({ id: "child-cm" });

      return parent.Root({}, [
        parent.Trigger({}, "Parent"),
        parent.Content({}, [
          parent.Item({ value: "cut" }, "Cut"),
          parent.Sub({ subInstance: sub }, [
            parent.SubTrigger({ subInstance: sub, value: "share" }, "Share"),
            parent.SubContent({ subInstance: sub }, [
              sub.Item({ value: "email", onSelect: onNested }, "Email"),
              sub.Item({ value: "teams" }, "Teams"),
            ]),
          ]),
        ]),
      ]);
    });

    const subTrigger = root.querySelector("[data-part='sub-trigger']") as HTMLElement;
    expect(subTrigger).not.toBeNull();
    expect(subTrigger.getAttribute("data-component")).toBe("context-menu");

    if (!isSSR) {
      expect(root.querySelector("[data-part='sub-content']")).toBeNull();

      subTrigger.click();
      expect(subTrigger.getAttribute("aria-expanded")).toBe("true");

      const subContent = root.querySelector("[data-part='sub-content']") as HTMLElement;
      expect(subContent).not.toBeNull();
      expect(subContent.getAttribute("data-component")).toBe("context-menu");

      const nestedItem = subContent.querySelector("[data-part='item']") as HTMLElement;
      nestedItem.click();
      expect(onNested).toHaveBeenCalledTimes(1);
    }
  });

  it("supports dynamic items in ContextMenu all-in-one when initially closed", () => {
    const itemsVal = createValue<ContextMenuItemDescriptor[]>(
      [
        { value: "act-1", label: "Action 1" },
        { value: "act-2", label: "Action 2" },
      ],
      { id: "cm-dyn-closed-items" },
    );

    const root = setup(() =>
      ContextMenu({
        id: "dyn-cm-closed",
        trigger: "Context Target",
        items: itemsVal,
      }),
    );

    if (!isSSR) {
      const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(trigger).not.toBeNull();

      // Add item while closed
      itemsVal((prev) => [...prev, { value: "act-3", label: "Action 3" }]);

      // Open context menu via right-click
      trigger.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: 100,
          clientY: 100,
        }),
      );

      let items = root.querySelectorAll("[data-part='item']");
      expect(items.length).toBe(3);
      expect(items[2]?.textContent).toContain("Action 3");

      // Close context menu via Escape
      const content = root.querySelector("[data-part='content']") as HTMLElement;
      content.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

      // Add 4th item while closed
      itemsVal((prev) => [...prev, { value: "act-4", label: "Action 4" }]);

      // Re-open context menu
      trigger.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: 100,
          clientY: 100,
        }),
      );

      items = root.querySelectorAll("[data-part='item']");
      expect(items.length).toBe(4);
      expect(items[3]?.textContent).toContain("Action 4");
    }
  });

  it("should have no accessibility violations (axe)", async () => {
    if (isSSR) return;

    const root = setup(() =>
      ContextMenu({
        id: "a11y-cm",
        defaultOpen: true,
        trigger: "Accessible Context Target",
        items: [
          { value: "save", label: "Save" },
          { value: "share", label: "Share" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });

  it("safely handles items with props.children or children descriptor without throwing TypeError", () => {
    let cmInstance!: ReturnType<typeof createContextMenu>;

    const root = setup(() => {
      cmInstance = createContextMenu({ id: "children-prop-cm" });
      return ContextMenu({
        id: "children-prop-cm",
        trigger: "Right-Click Here",
        items: [
          {
            value: "reload",
            label: "Reload",
            props: { children: ["Ctrl+R shortcut"] },
          },
          {
            value: "back",
            label: "Back",
            children: ["Alt+Left shortcut"],
          },
        ],
      });
    });

    if (!isSSR) {
      const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(() => {
        trigger.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: 50,
            clientY: 50,
          }),
        );
      }).not.toThrow();

      const items = root.querySelectorAll("[data-part='item']");
      expect(items.length).toBe(2);
      expect(items[0]?.textContent).toContain("Ctrl+R shortcut");
      expect(items[1]?.textContent).toContain("Alt+Left shortcut");
    }
  });
});
