import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createSelect, Select } from "./index.js";

describeDualMode("Select", ({ getDocument, isSSR }) => {
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
      Select({
        id: "fruit-select",
        label: "Favorite Fruit",
        placeholder: "Select a fruit...",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("select");
    expect(rootEl.getAttribute("role")).toBe("group");
    expect(rootEl.hasAttribute("data-closed")).toBe(true);
    expect(rootEl.hasAttribute("data-expanded")).toBe(false);

    const labelEl = root.querySelector("[data-part='label']") as HTMLElement;
    expect(labelEl).not.toBeNull();
    expect(labelEl.textContent).toBe("Favorite Fruit");
    expect(labelEl.id).toBe("fruit-select-label");

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName.toLowerCase()).toBe("button");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("listbox");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
    expect(triggerEl.getAttribute("aria-controls")).toBe("fruit-select-listbox");

    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;
    expect(valueEl).not.toBeNull();
    expect(valueEl.hasAttribute("data-placeholder-shown")).toBe(true);
    expect(valueEl.textContent).toBe("Select a fruit...");

    const iconEl = root.querySelector("[data-part='icon']") as HTMLElement;
    expect(iconEl).not.toBeNull();
    expect(iconEl.getAttribute("aria-hidden")).toBe("true");
    expect(iconEl.textContent).toBe("▼");

    const hiddenSelect = root.querySelector("[data-part='hidden-select']") as HTMLElement;
    expect(hiddenSelect).not.toBeNull();
    expect(hiddenSelect.getAttribute("aria-hidden")).toBe("true");
    expect(String(hiddenSelect.getAttribute("tabindex"))).toBe("-1");

    const optionElements = Array.from(hiddenSelect.querySelectorAll("option"));
    expect(optionElements.length).toBe(3);
  });

  it("supports fine-grained composition via createSelect (Tier 2)", () => {
    const root = setup(() => {
      const sel = createSelect({
        id: "custom-select",
        defaultValue: "item-2",
      });

      const item1 = sel.createItem({ value: "item-1" });
      const item2 = sel.createItem({ value: "item-2" });

      return sel.Root({}, [
        sel.Label({}, "Custom Label"),
        sel.Trigger({}, [sel.Value(), sel.Icon({}, "⮟")]),
        sel.Content({}, [
          sel.Listbox({}, [
            item1.Root({}, [item1.Label({}, "Item 1")]),
            item2.Root({}, [
              item2.Label({}, "Item 2"),
              item2.Indicator({}, "✓"),
            ]),
          ]),
        ]),
        sel.HiddenSelect(),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.id).toBe("custom-select-trigger");

    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;
    expect(valueEl.textContent).toBe("item-2");
  });

  it("can be opened on trigger pointer down and closed by clicking trigger", () => {
    const root = setup(() =>
      Select({
        id: "open-select",
        options: ["Apple", "Banana", "Cherry"],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();

      // Open on pointerdown
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

      const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
      expect(contentEl).not.toBeNull();

      const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;
      expect(listboxEl).not.toBeNull();

      // Close on pointerdown
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("closes when pressing the Escape key and restores focus to trigger", () => {
    const root = setup(() =>
      Select({
        id: "esc-select",
        options: ["One", "Two", "Three"],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

      // Press Escape
      getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
      expect(getDocument().activeElement).toBe(triggerEl);
    }
  });

  it("closes when clicking outside", () => {
    const root = setup(() =>
      Select({
        id: "outside-select",
        options: ["Alpha", "Beta"],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

      // Click outside on body
      getDocument().body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("focuses trigger when clicking the label", () => {
    const root = setup(() =>
      Select({
        id: "lbl-select",
        label: "Clickable Label",
        options: ["Item 1", "Item 2"],
      }),
    );

    const labelEl = root.querySelector("[data-part='label']") as HTMLElement;
    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      labelEl.click();
      expect(getDocument().activeElement).toBe(triggerEl);
    }
  });

  it("supports selecting an item on click and calling onChange in single selection mode", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      Select({
        id: "select-item",
        options: [
          { value: "red", label: "Red Color" },
          { value: "green", label: "Green Color" },
          { value: "blue", label: "Blue Color" },
        ],
        onChange,
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;

    if (!isSSR) {
      // Open dropdown
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));

      const options = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];
      expect(options).toHaveLength(3);

      // Click on green option
      options[1]?.click();

      expect(onChange).toHaveBeenCalledWith({ value: "green", label: "Green Color" });
      expect(valueEl.textContent).toBe("Green Color");
      expect(valueEl.hasAttribute("data-placeholder-shown")).toBe(false);

      // Single select closes dropdown automatically
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports multiple selection mode", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      Select({
        id: "multi-select",
        multiple: true,
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
        onChange,
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;

    if (!isSSR) {
      // Open dropdown
      triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));

      const options = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

      // Click Apple
      options[0]?.click();
      expect(onChange).toHaveBeenCalledWith([{ value: "apple", label: "Apple" }]);
      expect(valueEl.textContent).toBe("Apple");

      // Dropdown remains open in multi-select
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

      // Click Banana
      options[1]?.click();
      expect(onChange).toHaveBeenCalledWith([
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
      ]);
      expect(valueEl.textContent).toBe("Apple, Banana");
    }
  });

  it("supports keyboard opening with Enter, Space, and ArrowDown", () => {
    const root = setup(() =>
      Select({
        id: "kbd-open",
        options: ["One", "Two", "Three"],
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;

    if (!isSSR) {
      // ArrowDown opens
      triggerEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

      // Close
      getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("false");

      // Space opens
      triggerEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(triggerEl.getAttribute("aria-expanded")).toBe("true");
    }
  });

  it("supports closed trigger ArrowLeft and ArrowRight cycling in single select mode", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      Select({
        id: "cycle-select",
        defaultValue: "Two",
        options: ["One", "Two", "Three"],
        onChange,
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;
    expect(valueEl.textContent).toBe("Two");

    if (!isSSR) {
      // ArrowRight advances to Three
      triggerEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("Three");
      expect(valueEl.textContent).toBe("Three");

      // ArrowLeft goes back to Two
      triggerEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("Two");
      expect(valueEl.textContent).toBe("Two");
    }
  });

  it("supports closed trigger typeahead searching", () => {
    const onChange = vi.fn();
    const root = setup(() =>
      Select({
        id: "typeahead-select",
        options: ["Apple", "Banana", "Blueberry"],
        onChange,
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;

    if (!isSSR) {
      // Type 'b'
      triggerEl.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }));
      expect(onChange).toHaveBeenCalledWith("Banana");
      expect(valueEl.textContent).toBe("Banana");
    }
  });

  it("supports grouped sections with nested items", () => {
    const root = setup(() =>
      Select({
        id: "grouped-select",
        defaultOpen: true,
        options: [
          {
            type: "section",
            key: "fruits",
            label: "Fruits",
            items: [
              { value: "apple", label: "Apple" },
              { value: "orange", label: "Orange" },
            ],
          },
          {
            type: "section",
            key: "vegetables",
            label: "Vegetables",
            items: [{ value: "spinach", label: "Spinach" }],
          },
        ],
      }),
    );

    if (!isSSR) {
      const sections = Array.from(root.querySelectorAll("[data-part='section']"));
      expect(sections).toHaveLength(2);

      const labels = Array.from(root.querySelectorAll("[data-part='section-label']"));
      expect(labels).toHaveLength(2);
      expect(labels[0]?.textContent).toContain("Fruits");
      expect(labels[1]?.textContent).toContain("Vegetables");

      const options = Array.from(root.querySelectorAll("[role='option']"));
      expect(options).toHaveLength(3);
    }
  });

  it("supports dynamic runtime options updates via reactive Value", () => {
    const optionsVal = createValue(
      [
        { value: "alpha", label: "Alpha" },
        { value: "beta", label: "Beta" },
      ],
      { id: "dyn-opts" },
    );

    const root = setup(() =>
      Select({
        id: "dyn-select",
        options: optionsVal,
        defaultOpen: true,
      }),
    );

    if (!isSSR) {
      let options = Array.from(root.querySelectorAll("[role='option']"));
      expect(options).toHaveLength(2);

      // Add gamma at runtime
      optionsVal((prev) => [...prev, { value: "gamma", label: "Gamma" }]);
      options = Array.from(root.querySelectorAll("[role='option']"));
      expect(options).toHaveLength(3);

      const hiddenSelect = root.querySelector("[data-part='hidden-select']") as HTMLSelectElement;
      expect(hiddenSelect.options.length).toBe(3);
    }
  });

  it("supports form reset listener", () => {
    if (isSSR) return;

    let formEl: HTMLFormElement;
    const root = setup(() => {
      formEl = getDocument().createElement("form");
      const sel = createSelect({
        id: "form-select",
        name: "color",
        defaultValue: "red",
        options: [
          { value: "red", label: "Red" },
          { value: "green", label: "Green" },
        ],
      });
      const selEl = sel.Root({}, [
        sel.Trigger({}, [sel.Value()]),
        sel.Content({}, [
          sel.Listbox({}, [
            sel.Item({ value: "red", label: "Red" }),
            sel.Item({ value: "green", label: "Green" }),
          ]),
        ]),
        sel.HiddenSelect(),
      ]);
      formEl.appendChild(selEl);
      return formEl;
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const valueEl = root.querySelector("[data-part='value']") as HTMLElement;
    expect(valueEl.textContent).toBe("Red");

    // Change to Green
    triggerEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
    const options = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];
    options[1]?.click();
    expect(valueEl.textContent).toBe("Green");

    // Reset form
    formEl!.reset();
    expect(valueEl.textContent).toBe("Red");
  });

  it("should have no accessibility violations (axe)", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Select({
        id: "a11y-select",
        label: "Accessible Fruit Selection",
        placeholder: "Pick one...",
        defaultValue: "banana",
        options: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});
