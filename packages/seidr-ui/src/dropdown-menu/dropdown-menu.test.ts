import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createDropdownMenu, DropdownMenu, type DropdownMenuItemDescriptor } from "./index.js";

describeDualMode("DropdownMenu", ({ getDocument, isSSR }) => {
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
      DropdownMenu({
        id: "test-dropdown",
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
    expect(rootEl.getAttribute("data-component")).toBe("dropdown-menu");

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName.toLowerCase()).toBe("button");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("menu");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
    expect(triggerEl.getAttribute("aria-controls")).toBe("test-dropdown-content");
    expect(triggerEl.getAttribute("data-component")).toBe("dropdown-menu");
    expect(triggerEl.textContent).toBe("Actions");

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports fine-grained composition via createDropdownMenu (Tier 2)", () => {
    const onSave = vi.fn();

    const root = setup(() => {
      const dropdown = createDropdownMenu({ id: "custom-dropdown", defaultOpen: true });

      return dropdown.Root({}, [
        dropdown.Trigger({}, "Options"),
        dropdown.Content({}, [
          dropdown.Item({ value: "save", onSelect: onSave }, [
            dropdown.Icon({}, "💾"),
            dropdown.ItemLabel({}, "Save"),
            dropdown.ItemDescription({}, "Save current changes"),
          ]),
          dropdown.Separator(),
          dropdown.CheckboxItem({ value: "autosave", defaultChecked: true }, [
            dropdown.ItemIndicator({}, "✓"),
            dropdown.ItemLabel({}, "Autosave"),
          ]),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.textContent).toBe("Options");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("menu");
    expect(contentEl.getAttribute("data-component")).toBe("dropdown-menu");

    const itemEl = root.querySelector("[data-part='item']") as HTMLElement;
    expect(itemEl).not.toBeNull();
    expect(itemEl.getAttribute("role")).toBe("menuitem");
    expect(itemEl.getAttribute("data-component")).toBe("dropdown-menu");

    const separatorEl = root.querySelector("[data-part='separator']") as HTMLElement;
    expect(separatorEl).not.toBeNull();
    expect(separatorEl.getAttribute("role")).toBe("separator");
    expect(separatorEl.getAttribute("data-component")).toBe("dropdown-menu");

    const checkboxEl = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkboxEl).not.toBeNull();
    expect(checkboxEl.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkboxEl.getAttribute("data-component")).toBe("dropdown-menu");
    expect(checkboxEl.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles open state when clicking the trigger", () => {
    const root = setup(() =>
      DropdownMenu({
        id: "toggle-dropdown",
        trigger: "Open Menu",
        items: [{ value: "item-1", label: "Item 1" }],
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
      DropdownMenu({
        id: "esc-dropdown",
        defaultOpen: true,
        trigger: "Escape Test",
        items: [{ value: "opt", label: "Option" }],
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
      DropdownMenu({
        id: "select-dropdown",
        defaultOpen: true,
        trigger: "Select Test",
        items: [{ value: "save", label: "Save", onSelect }],
      }),
    );

    if (!isSSR) {
      const saveItem = root.querySelector("[data-part='item']") as HTMLElement;
      expect(saveItem).not.toBeNull();

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
      DropdownMenu({
        id: "persist-dropdown",
        defaultOpen: true,
        trigger: "Persist Test",
        items: [{ value: "stay", label: "Stay Open", closeOnSelect: false, onSelect }],
      }),
    );

    if (!isSSR) {
      const stayItem = root.querySelector("[data-part='item']") as HTMLElement;
      stayItem.click();
      expect(onSelect).toHaveBeenCalledTimes(1);

      // Should still be open
      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");
      expect(root.querySelector("[data-part='content']")).not.toBeNull();
    }
  });

  it("handles keyboard roving navigation (ArrowDown, ArrowUp, Home, End)", () => {
    const root = setup(() =>
      DropdownMenu({
        id: "nav-dropdown",
        defaultOpen: true,
        trigger: "Nav Test",
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

      // ArrowDown moves to first enabled item ("a")
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
    const onCheckedChange = vi.fn();

    const root = setup(() => {
      const dropdown = createDropdownMenu({ id: "checkbox-dropdown", defaultOpen: true });
      return dropdown.Root({}, [
        dropdown.Trigger({}, "Checkboxes"),
        dropdown.Content({}, [
          dropdown.CheckboxItem(
            { value: "show-line-numbers", defaultChecked: false, onChange: onCheckedChange },
            [dropdown.ItemLabel({}, "Line Numbers")],
          ),
        ]),
      ]);
    });

    const checkboxEl = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkboxEl.getAttribute("aria-checked")).toBe("false");
    expect(checkboxEl.hasAttribute("data-checked")).toBe(false);

    if (!isSSR) {
      checkboxEl.click();
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(checkboxEl.getAttribute("aria-checked")).toBe("true");
      expect(checkboxEl.hasAttribute("data-checked")).toBe(true);

      checkboxEl.click();
      expect(onCheckedChange).toHaveBeenCalledWith(false);
      expect(checkboxEl.getAttribute("aria-checked")).toBe("false");
    }
  });

  it("manages radio group selection", () => {
    const onRadioChange = vi.fn();

    const root = setup(() =>
      DropdownMenu({
        id: "radio-dropdown",
        defaultOpen: true,
        trigger: "Radio Test",
        items: [
          {
            type: "radio-group",
            defaultValue: "light",
            onChange: onRadioChange,
            items: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
          },
        ],
      }),
    );

    const radioItems = root.querySelectorAll("[data-part='radio-item']");
    expect(radioItems.length).toBe(2);
    expect(radioItems[0]?.getAttribute("aria-checked")).toBe("true");
    expect(radioItems[1]?.getAttribute("aria-checked")).toBe("false");

    if (!isSSR) {
      const darkItem = radioItems[1] as HTMLElement;
      darkItem.click();

      expect(onRadioChange).toHaveBeenCalledWith("dark");
      expect(radioItems[0]?.getAttribute("aria-checked")).toBe("false");
      expect(radioItems[1]?.getAttribute("aria-checked")).toBe("true");
    }
  });

  it("supports createRadioGroup fine-grained coordinator in Tier 2", () => {
    const selected = createValue<string>("system", { id: "dropdown-radio-mode" });
    const onChange = vi.fn((val: string) => selected(val));

    const root = setup(() => {
      const dropdown = createDropdownMenu({ id: "fine-radio-dropdown", defaultOpen: true });
      const themeGroup = dropdown.createRadioGroup({ value: selected, onChange });

      return dropdown.Root({}, [
        dropdown.Trigger({}, "Theme"),
        dropdown.Content({}, [
          themeGroup.Root({}, [
            themeGroup.Item({ value: "light" }, "Light"),
            themeGroup.Item({ value: "dark" }, "Dark"),
            themeGroup.Item({ value: "system" }, "System"),
          ]),
        ]),
      ]);
    });

    const items = root.querySelectorAll("[data-part='radio-item']");
    expect(items.length).toBe(3);
    expect(items[0]?.getAttribute("aria-checked")).toBe("false");
    expect(items[1]?.getAttribute("aria-checked")).toBe("false");
    expect(items[2]?.getAttribute("aria-checked")).toBe("true");

    if (!isSSR) {
      const lightItem = items[0] as HTMLElement;
      lightItem.click();

      expect(onChange).toHaveBeenCalledWith("light");
      expect(selected()).toBe("light");
      expect(items[0]?.getAttribute("aria-checked")).toBe("true");
      expect(items[2]?.getAttribute("aria-checked")).toBe("false");
    }
  });

  it("supports submenu hierarchy and keyboard navigation", () => {
    const root = setup(() => {
      const parent = createDropdownMenu({ id: "parent-dropdown", defaultOpen: true });
      const sub = parent.createSub({ id: "child-sub" });

      return parent.Root({}, [
        parent.Trigger({}, "Parent"),
        parent.Content({}, [
          parent.Item({ value: "cut" }, "Cut"),
          parent.Sub({ subInstance: sub }, [
            parent.SubTrigger({ subInstance: sub, value: "share" }, "Share"),
            parent.SubContent({ subInstance: sub }, [
              sub.Item({ value: "email" }, "Email"),
              sub.Item({ value: "teams" }, "Teams"),
            ]),
          ]),
        ]),
      ]);
    });

    const subTrigger = root.querySelector("[data-part='sub-trigger']") as HTMLElement;
    expect(subTrigger).not.toBeNull();
    expect(subTrigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(subTrigger.getAttribute("aria-expanded")).toBe("false");
    expect(subTrigger.getAttribute("data-component")).toBe("dropdown-menu");

    if (!isSSR) {
      // Submenu content is not mounted initially
      expect(root.querySelector("[data-part='sub-content']")).toBeNull();

      // Open submenu via click
      subTrigger.click();
      expect(subTrigger.getAttribute("aria-expanded")).toBe("true");

      const subContent = root.querySelector("[data-part='sub-content']") as HTMLElement;
      expect(subContent).not.toBeNull();
      expect(subContent.getAttribute("data-component")).toBe("dropdown-menu");

      // Close submenu via ArrowLeft inside child content
      subContent.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(subTrigger.getAttribute("aria-expanded")).toBe("false");
    }
  });

  it("supports dynamic items in DropdownMenu all-in-one when initially closed", () => {
    const itemsVal = createValue<DropdownMenuItemDescriptor[]>(
      [
        { value: "act-1", label: "Action 1" },
        { value: "act-2", label: "Action 2" },
      ],
      { id: "dropdown-dyn-closed-items" },
    );

    const root = setup(() =>
      DropdownMenu({
        id: "dyn-dropdown-closed",
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
      expect(items[2]?.textContent).toContain("Action 3");

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

  it("passes axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      DropdownMenu({
        id: "axe-dropdown",
        defaultOpen: true,
        trigger: "Axe Test",
        items: [
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});

