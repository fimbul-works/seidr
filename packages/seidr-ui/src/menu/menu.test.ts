import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createMenu, Menu, type MenuItemDescriptor } from "./index.js";

describeDualMode("Menu", ({ getDocument, isSSR }) => {
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
      Menu({
        id: "test-menu",
        trigger: "Actions",
        items: [
          { value: "edit", label: "Edit" },
          { value: "duplicate", label: "Duplicate" },
          { value: "delete", label: "Delete", disabled: true },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("menu");

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName.toLowerCase()).toBe("button");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("menu");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
    expect(triggerEl.getAttribute("aria-controls")).toBe("test-menu-content");
    expect(triggerEl.textContent).toBe("Actions");

    if (!isSSR) {
      // Content should not be mounted initially when uncontrolled defaultOpen: false
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports fine-grained composition via createMenu (Tier 2)", () => {
    const onSave = vi.fn();

    const root = setup(() => {
      const menu = createMenu({ id: "custom-menu", defaultOpen: true });

      return menu.Root({}, [
        menu.Trigger({}, "File Options"),
        menu.Content({}, [
          menu.Item({ value: "save", onSelect: onSave }, [
            menu.Icon({}, "💾"),
            menu.ItemLabel({}, "Save"),
            menu.ItemDescription({}, "Save current changes"),
          ]),
          menu.Separator(),
          menu.CheckboxItem({ value: "autosave", defaultChecked: true }, [
            menu.ItemIndicator({}, "✓"),
            menu.ItemLabel({}, "Autosave"),
          ]),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.textContent).toBe("File Options");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("menu");
    expect(contentEl.getAttribute("data-component")).toBe("menu");

    const itemEl = root.querySelector("[data-part='item']") as HTMLElement;
    expect(itemEl).not.toBeNull();
    expect(itemEl.getAttribute("role")).toBe("menuitem");
    expect(itemEl.getAttribute("data-value")).toBe("save");

    const labelEl = itemEl.querySelector("[data-part='item-label']");
    expect(labelEl?.textContent).toBe("Save");

    const descEl = itemEl.querySelector("[data-part='item-description']");
    expect(descEl?.textContent).toBe("Save current changes");

    const checkboxEl = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkboxEl).not.toBeNull();
    expect(checkboxEl.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkboxEl.getAttribute("aria-checked")).toBe("true");
    expect(checkboxEl.hasAttribute("data-checked")).toBe(true);
  });

  it("toggles open state when clicking the trigger", () => {
    const root = setup(() =>
      Menu({
        id: "toggle-menu",
        trigger: "Toggle Me",
        items: [
          { value: "item-1", label: "Item 1" },
          { value: "item-2", label: "Item 2" },
        ],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl.getAttribute("aria-expanded")).toBe("false");

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();

      // Open on click
      triggerEl.click();
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");
      expect(root.querySelector("[data-part='content']")).not.toBeNull();

      // Close on second click
      triggerEl.click();
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("closes on Escape key and returns focus to trigger", () => {
    const root = setup(() =>
      Menu({
        id: "esc-menu",
        defaultOpen: true,
        trigger: "Esc Menu",
        items: [{ value: "first", label: "First" }],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
      expect(contentEl).not.toBeNull();

      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("activates an item on click and triggers onSelect callback", () => {
    const onSelect = vi.fn();

    const root = setup(() =>
      Menu({
        id: "select-menu",
        defaultOpen: true,
        trigger: "Actions",
        items: [
          { value: "save", label: "Save", onSelect },
          { value: "export", label: "Export" },
        ],
      }),
    );

    if (!isSSR) {
      const items = root.querySelectorAll("[data-part='item']");
      const saveItem = items[0] as HTMLElement;

      saveItem.click();
      expect(onSelect).toHaveBeenCalledTimes(1);

      // Default closeOnSelect is true, so content should be closed
      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("respects closeOnSelect: false", () => {
    const onSelect = vi.fn();

    const root = setup(() =>
      Menu({
        id: "no-close-menu",
        defaultOpen: true,
        trigger: "Actions",
        items: [{ value: "pin", label: "Pin", closeOnSelect: false, onSelect }],
      }),
    );

    if (!isSSR) {
      const pinItem = root.querySelector("[data-part='item']") as HTMLElement;
      pinItem.click();
      expect(onSelect).toHaveBeenCalledTimes(1);

      // Should still be open
      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");
      expect(root.querySelector("[data-part='content']")).not.toBeNull();
    }
  });

  it("handles keyboard roving navigation (ArrowDown, ArrowUp, Home, End)", () => {
    const root = setup(() =>
      Menu({
        id: "nav-menu",
        defaultOpen: true,
        trigger: "Navigate",
        items: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
          { value: "c", label: "Gamma" },
          { value: "d", label: "Delta" },
        ],
      }),
    );

    if (!isSSR) {
      const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
      const items = root.querySelectorAll("[data-part='item']");

      // ArrowDown should move to first enabled item ("a")
      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(items[0]?.hasAttribute("data-highlighted")).toBe(true);

      // ArrowDown skips disabled item "b" -> moves to "c"
      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(items[2]?.hasAttribute("data-highlighted")).toBe(true);
      expect(items[0]?.hasAttribute("data-highlighted")).toBe(false);

      // ArrowUp moves back to "a"
      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(items[0]?.hasAttribute("data-highlighted")).toBe(true);

      // End moves to last enabled item ("d")
      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(items[3]?.hasAttribute("data-highlighted")).toBe(true);

      // Home moves back to "a"
      contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(items[0]?.hasAttribute("data-highlighted")).toBe(true);
    }
  });

  it("manages checkbox item state and toggling", () => {
    const onChange = vi.fn();

    const root = setup(() =>
      Menu({
        id: "checkbox-menu",
        defaultOpen: true,
        trigger: "Preferences",
        items: [
          {
            type: "checkbox",
            value: "notifications",
            label: "Notifications",
            defaultChecked: false,
            onChange,
            indicator: "✓",
          },
        ],
      }),
    );

    const checkboxEl = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkboxEl).not.toBeNull();
    expect(checkboxEl.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkboxEl.getAttribute("aria-checked")).toBe("false");
    expect(checkboxEl.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      checkboxEl.click();
      expect(onChange).toHaveBeenCalledWith(true);
      expect(checkboxEl.getAttribute("aria-checked")).toBe("true");
      expect(checkboxEl.hasAttribute("data-checked")).toBe(true);

      // Toggle off
      checkboxEl.click();
      expect(onChange).toHaveBeenCalledWith(false);
      expect(checkboxEl.getAttribute("aria-checked")).toBe("false");
      expect(checkboxEl.hasAttribute("data-checked")).toBe(false);
    }
  });

  it("manages radio group selection", () => {
    const onChange = vi.fn();

    const root = setup(() =>
      Menu({
        id: "radio-menu",
        defaultOpen: true,
        trigger: "Sort",
        items: [
          {
            type: "radio-group",
            defaultValue: "date",
            onChange,
            items: [
              { value: "name", label: "By Name" },
              { value: "date", label: "By Date" },
              { value: "size", label: "By Size" },
            ],
          },
        ],
      }),
    );

    const radioItems = root.querySelectorAll("[data-part='radio-item']");
    expect(radioItems.length).toBe(3);

    // "date" initially selected
    expect(radioItems[1]?.getAttribute("aria-checked")).toBe("true");
    expect(radioItems[0]?.getAttribute("aria-checked")).toBe("false");

    if (!isSSR) {
      (radioItems[0] as HTMLElement).click();
      expect(onChange).toHaveBeenCalledWith("name");
      expect(radioItems[0]?.getAttribute("aria-checked")).toBe("true");
      expect(radioItems[1]?.getAttribute("aria-checked")).toBe("false");
    }
  });

  it("supports createRadioGroup fine-grained coordinator in Tier 2", () => {
    const onChange = vi.fn();

    const root = setup(() => {
      const menu = createMenu({ id: "coord-menu", defaultOpen: true });
      const group = menu.createRadioGroup({ defaultValue: "opt-b", onChange });

      return menu.Root({}, [
        menu.Trigger({}, "Options"),
        menu.Content({}, [
          group.Root({}, [
            group.Item({ value: "opt-a" }, "Option A"),
            group.Item({ value: "opt-b" }, "Option B"),
          ]),
        ]),
      ]);
    });

    const radioItems = root.querySelectorAll("[data-part='radio-item']");
    expect(radioItems.length).toBe(2);
    expect(radioItems[1]?.getAttribute("aria-checked")).toBe("true");
    expect(radioItems[0]?.getAttribute("aria-checked")).toBe("false");

    if (!isSSR) {
      (radioItems[0] as HTMLElement).click();
      expect(onChange).toHaveBeenCalledWith("opt-a");
      expect(radioItems[0]?.getAttribute("aria-checked")).toBe("true");
      expect(radioItems[1]?.getAttribute("aria-checked")).toBe("false");
    }
  });

  it("supports submenu hierarchy and keyboard navigation", () => {
    const root = setup(() => {
      const menu = createMenu({ id: "parent-menu", defaultOpen: true });
      const sub = menu.createSub({ id: "child-menu" });

      return menu.Root({}, [
        menu.Trigger({}, "File"),
        menu.Content({}, [
          menu.Item({ value: "new" }, "New Window"),
          menu.Sub({ subInstance: sub }, [
            menu.SubTrigger({ subInstance: sub, value: "share" }, "Share"),
            menu.SubContent({ subInstance: sub }, [
              sub.Item({ value: "email" }, "Email"),
              sub.Item({ value: "link" }, "Copy Link"),
            ]),
          ]),
        ]),
      ]);
    });

    const subTrigger = root.querySelector("[data-part='sub-trigger']") as HTMLElement;
    expect(subTrigger).not.toBeNull();
    expect(subTrigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(subTrigger.getAttribute("aria-expanded")).toBe("false");

    if (!isSSR) {
      // Open submenu via click
      subTrigger.click();
      expect(subTrigger.getAttribute("aria-expanded")).toBe("true");

      const subContent = root.querySelector("[data-part='sub-content']") as HTMLElement;
      expect(subContent).not.toBeNull();

      // Close submenu via ArrowLeft inside child content
      subContent.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(subTrigger.getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("supports dynamic reactive item list (menu.List)", () => {
    const itemsValue = createValue<MenuItemDescriptor[]>(
      [
        { value: "opt-1", label: "Option 1" },
        { value: "opt-2", label: "Option 2" },
      ],
      { id: "dynamic-menu-items" },
    );

    const root = setup(() => {
      const menu = createMenu({ id: "dynamic-menu", defaultOpen: true });
      return menu.Root({}, [
        menu.Trigger({}, "Dynamic"),
        menu.Content({}, [menu.List(itemsValue)]),
      ]);
    });

    const initialItems = root.querySelectorAll("[data-part='item']");
    expect(initialItems.length).toBe(2);
    expect(initialItems[0]?.textContent).toContain("Option 1");
    expect(initialItems[1]?.textContent).toContain("Option 2");

    if (!isSSR) {
      // Dynamically add a third item
      itemsValue([
        { value: "opt-1", label: "Option 1" },
        { value: "opt-2", label: "Option 2" },
        { value: "opt-3", label: "Option 3 (Added)" },
      ]);

      const updatedItems = root.querySelectorAll("[data-part='item']");
      expect(updatedItems.length).toBe(3);
      expect(updatedItems[2]?.textContent).toContain("Option 3 (Added)");
    }
  });

  it("supports dynamic items in Menu all-in-one when initially closed", () => {
    const itemsVal = createValue<MenuItemDescriptor[]>(
      [
        { value: "act-1", label: "Action 1" },
        { value: "act-2", label: "Action 2" },
      ],
      { id: "dyn-closed-items" },
    );

    const root = setup(() =>
      Menu({
        id: "dyn-menu-closed",
        trigger: "Actions",
        items: itemsVal,
      }),
    );

    if (!isSSR) {
      const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(trigger).not.toBeNull();

      // Add item while closed
      itemsVal((prev) => [...prev, { value: "act-3", label: "Action 3" }]);

      // Open menu
      trigger.click();

      let items = root.querySelectorAll("[data-part='item']");
      expect(items.length).toBe(3);

      // Close menu
      trigger.click();

      // Add a 4th item while closed again
      itemsVal((prev) => [...prev, { value: "act-4", label: "Action 4" }]);

      // Re-open menu
      trigger.click();

      items = root.querySelectorAll("[data-part='item']");
      expect(items.length).toBe(4);
      expect(items[3]?.textContent).toContain("Action 4");
    }
  });

  it("supports portaling menu content and submenus via portalTarget", () => {
    if (isSSR) return;

    const portalHost = getDocument().createElement("div");
    portalHost.id = "menu-portal-host";
    getDocument().body.appendChild(portalHost);

    try {
      const onSelect = vi.fn();
      const root = setup(() =>
        Menu({
          id: "portaled-menu",
          portalTarget: portalHost,
          trigger: "Actions",
          items: [
            { value: "copy", label: "Copy", onSelect },
            {
              type: "sub",
              value: "more",
              label: "More",
              items: [{ value: "archive", label: "Archive", onSelect }],
            },
          ],
        }),
      );

      const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
      trigger.click();

      expect(root.querySelector("[data-part='content']")).toBeNull();
      expect(portalHost.querySelector("[data-part='content']")).not.toBeNull();

      // Open submenu inside portaled content
      const subTrigger = portalHost.querySelector("[data-part='sub-trigger']") as HTMLElement;
      subTrigger.click();

      expect(portalHost.querySelector("[data-part='sub-content']")).not.toBeNull();

      // Click submenu item
      const subItem = portalHost.querySelector("[data-part='sub-content'] [data-part='item']") as HTMLElement;
      subItem.click();
      expect(onSelect).toHaveBeenCalledTimes(1);
    } finally {
      portalHost.remove();
    }
  });

  it("passes axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Menu({
        id: "a11y-menu",
        defaultOpen: true,
        trigger: "Preferences",
        items: [
          { value: "profile", label: "View Profile" },
          { value: "settings", label: "Settings" },
          { type: "separator" },
          { value: "logout", label: "Log Out" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});
