import { $, createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Combobox, createCombobox } from "./index.js";

describeDualMode("Combobox", ({ getDocument, isSSR }) => {
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
      Combobox({
        id: "fruit-cb",
        label: "Favorite Fruit",
        placeholder: "Type to search...",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("combobox");
    expect(rootEl.getAttribute("role")).toBe("group");
    expect(rootEl.hasAttribute("data-closed")).toBe(true);

    const labelEl = root.querySelector("[data-part='label']") as HTMLElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.textContent).toBe("Favorite Fruit");
    expect(labelEl.id).toBe("fruit-cb-label");

    const controlEl = root.querySelector("[data-part='control']") as HTMLElement;
    expect(controlEl).not.toBeNull();
    expect(controlEl.getAttribute("data-component")).toBe("combobox");

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl).not.toBeNull();
    expect(inputEl.getAttribute("role")).toBe("combobox");
    expect(inputEl.getAttribute("aria-haspopup")).toBe("listbox");
    expect(inputEl.getAttribute("aria-autocomplete")).toBe("list");
    expect(inputEl.getAttribute("aria-expanded")).toBe("false");
    expect(inputEl.getAttribute("placeholder")).toBe("Type to search...");
    expect(inputEl.id).toBe("fruit-cb-input");

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName.toLowerCase()).toBe("button");
    expect(String(triggerEl.getAttribute("tabindex"))).toBe("-1");

    const hiddenSelect = root.querySelector("[data-part='hidden-select']") as HTMLElement;
    expect(hiddenSelect).not.toBeNull();
    expect(hiddenSelect.getAttribute("aria-hidden")).toBe("true");
    expect(String(hiddenSelect.getAttribute("tabindex"))).toBe("-1");
  });

  it("supports fine-grained composition via createCombobox (Tier 2)", () => {
    const root = setup(() => {
      const cb = createCombobox({
        id: "custom-cb",
        defaultValue: "item-2",
        options: [
          { value: "item-1", label: "Item 1" },
          { value: "item-2", label: "Item 2" },
        ],
      });

      const item1 = cb.createItem({ value: "item-1" });
      const item2 = cb.createItem({ value: "item-2" });

      return cb.Root({}, [
        cb.Label({}, "Custom Combobox"),
        cb.Control({}, [
          cb.Input(),
          cb.Trigger({}, [cb.Icon({}, "▼")]),
        ]),
        cb.Content({}, [
          cb.Listbox({}, [
            item1.Root({}, [item1.Label({}, "Item 1")]),
            item2.Root({}, [
              item2.Label({}, "Item 2"),
              item2.Indicator({}, "✓"),
            ]),
          ]),
        ]),
        cb.HiddenSelect(),
      ]);
    });

    const rootEl = root.querySelector("[data-part='root']");
    expect(rootEl).not.toBeNull();
    expect(rootEl?.getAttribute("data-component")).toBe("combobox");

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl).not.toBeNull();
    expect(inputEl.value).toBe("Item 2");
  });

  it("typing into input filters options dynamically and opens dropdown", () => {
    if (isSSR) return;

    const root = setup(() =>
      Combobox({
        id: "search-fruits",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "avocado", label: "Avocado" },
        ],
      }),
    );

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl).not.toBeNull();

    // Initially closed
    expect(root.querySelector("[data-part='content']")).toBeNull();

    // Type "av"
    inputEl.value = "av";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));

    // Dropdown is now open
    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(inputEl.getAttribute("aria-expanded")).toBe("true");

    // Only Avocado should be visible in the listbox
    const items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(1);
    expect(items[0]?.textContent).toContain("Avocado");
  });

  it("clicking trigger button opens dropdown showing all options", () => {
    if (isSSR) return;

    const root = setup(() =>
      Combobox({
        id: "trigger-cb",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;

    triggerEl.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
    triggerEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(inputEl.getAttribute("aria-expanded")).toBe("true");

    const items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(3);
  });

  it("keyboard navigation with ArrowDown and Enter selects item", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Combobox({
        id: "keyboard-cb",
        onChange,
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ],
      }),
    );

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;

    // ArrowDown while closed opens menu
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(root.querySelector("[data-part='content']")).not.toBeNull();

    // ArrowDown highlights banana
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

    // Enter selects banana
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onChange).toHaveBeenCalledWith("banana");
    expect(inputEl.value).toBe("Banana");
    // Menu closes after selection
    expect(root.querySelector("[data-part='content']")).toBeNull();
  });

  it("closing with Escape key resets input value to active selection", () => {
    if (isSSR) return;

    const root = setup(() =>
      Combobox({
        id: "escape-cb",
        defaultValue: "apple",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ],
      }),
    );

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl.value).toBe("Apple");

    // Type "xyz"
    inputEl.value = "xyz";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    expect(root.querySelector("[data-part='content']")).toBeNull(); // no matches

    // Open and press Escape
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    // Reverted to "Apple"
    expect(inputEl.value).toBe("Apple");
  });

  it("supports multi-selection and backspace removal", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Combobox({
        id: "multi-cb",
        multiple: true,
        defaultValue: ["apple"],
        onChange,
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl.value).toBe("");

    // Open dropdown and select banana
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);

    // Backspace on empty input removes last selection
    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(["apple"]);
  });

  it("supports reactive dynamic option lists at runtime", () => {
    if (isSSR) return;

    const dynamicOptions = createValue([
      { value: "cat", label: "Cat" },
      { value: "dog", label: "Dog" },
    ]);

    const root = setup(() =>
      Combobox({
        id: "dyn-cb",
        options: dynamicOptions,
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    triggerEl.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
    triggerEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    let items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(2);

    // Add bird
    dynamicOptions((prev) => [...prev, { value: "bird", label: "Bird" }]);

    items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(3);
    expect(items[2]?.textContent).toContain("Bird");
  });

  it("supports grouped sections with Section and SectionLabel", () => {
    const root = setup(() =>
      Combobox({
        id: "grouped-cb",
        options: [
          {
            key: "fruits",
            label: "Fruits",
            items: [
              { value: "apple", label: "Apple" },
              { value: "orange", label: "Orange" },
            ],
          },
          {
            key: "veggies",
            label: "Vegetables",
            items: [{ value: "carrot", label: "Carrot" }],
          },
        ],
      }),
    );

    if (!isSSR) {
      const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
      triggerEl.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
      triggerEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      const sections = root.querySelectorAll("[data-part='section']");
      expect(sections.length).toBe(2);

      const sectionLabels = root.querySelectorAll("[data-part='section-label']");
      expect(sectionLabels.length).toBe(2);
      expect(sectionLabels[0]?.textContent).toBe("Fruits");
      expect(sectionLabels[1]?.textContent).toBe("Vegetables");
    }
  });

  it("supports form reset listener", () => {
    if (isSSR) return;

    let cbInstance: any;
    const form = getDocument().createElement("form");
    getDocument().body.appendChild(form);

    target = getDocument().createElement("div");
    form.appendChild(target);

    const App = createComponent(() => {
      cbInstance = createCombobox({
        id: "form-cb",
        defaultValue: "initial-val",
        options: [
          { value: "initial-val", label: "Initial Value" },
          { value: "other-val", label: "Other Value" },
        ],
      });

      return cbInstance.Root({}, [
        cbInstance.Control({}, [
          cbInstance.Input(),
          cbInstance.Trigger(),
        ]),
        cbInstance.HiddenSelect(),
      ]);
    });

    unmount = mount(App, target);

    const inputEl = form.querySelector("[data-part='input']") as HTMLInputElement;
    expect(inputEl.value).toBe("Initial Value");

    // Select other value
    cbInstance.listbox.toggleOrSelect("other-val");
    expect(inputEl.value).toBe("Other Value");

    // Reset form
    form.reset();

    expect(inputEl.value).toBe("Initial Value");
    expect(cbInstance.selectedOptions()[0]?.value).toBe("initial-val");

    form.remove();
  });

  it("passes axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Combobox({
        id: "a11y-cb",
        label: "Accessible Combobox",
        options: [
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});

