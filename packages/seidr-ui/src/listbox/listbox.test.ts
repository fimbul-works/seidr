import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createListbox, Listbox } from "./index.js";

describeDualMode("Listbox", ({ getDocument, isSSR }) => {
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

  it("should render default structure, roles, and semantic data attributes", () => {
    const root = setup(() =>
      Listbox({
        id: "test-listbox",
        items: [
          { value: "react", label: "React" },
          { value: "solid", label: "Solid" },
          { value: "seidr", label: "Seidr" },
        ],
        defaultValue: "seidr",
      }),
    );

    const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    expect(listboxEl).not.toBeNull();
    expect(listboxEl.getAttribute("data-component")).toBe("listbox");
    expect(listboxEl.getAttribute("data-part")).toBe("root");
    expect(listboxEl.getAttribute("data-orientation")).toBe("vertical");
    expect(listboxEl.getAttribute("aria-orientation")).toBe("vertical");

    expect(items.length).toBe(3);

    expect(items[0]?.getAttribute("data-component")).toBe("listbox");
    expect(items[0]?.getAttribute("data-part")).toBe("item");
    expect(items[0]?.getAttribute("data-key")).toBe("react");
    expect(items[0]?.getAttribute("aria-selected")).toBe("false");
    expect(items[0]?.getAttribute("aria-disabled")).toBe("false");
    expect(items[0]?.hasAttribute("data-selected")).toBe(false);

    expect(items[2]?.getAttribute("data-key")).toBe("seidr");
    expect(items[2]?.getAttribute("aria-selected")).toBe("true");
    expect(items[2]?.hasAttribute("data-selected")).toBe(true);
  });

  it("supports fine-grained composition via createListbox (Tier 2)", () => {
    const root = setup(() => {
      const lb = createListbox({ id: "custom-lb", defaultValue: "item-1" });
      const item1 = lb.createItem({ value: "item-1" });
      const item2 = lb.createItem({ value: "item-2", disabled: true });

      return lb.Root({ ariaLabel: "Custom Options" }, [
        lb.Section({}, [
          lb.SectionLabel({}, "Section 1"),
          item1.Item({}, [
            item1.ItemLabel({}, "Item One"),
            item1.ItemDescription({}, "First option description"),
            item1.ItemIndicator({}, "✓"),
          ]),
          item2.Item({}, [
            item2.ItemLabel({}, "Item Two"),
            item2.ItemDescription({}, "Second option description"),
            item2.ItemIndicator({}, "✓"),
          ]),
        ]),
      ]);
    });

    const rootEl = root.querySelector("[role='listbox']") as HTMLElement;
    const sectionEl = root.querySelector("[data-part='section']") as HTMLElement;
    const sectionLabelEl = root.querySelector("[data-part='section-label']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];
    const itemLabelEl = root.querySelector("[data-part='item-label']") as HTMLElement;
    const itemDescEl = root.querySelector("[data-part='item-description']") as HTMLElement;
    const indicatorEl = root.querySelector("[data-part='item-indicator']") as HTMLElement;

    expect(rootEl).not.toBeNull();
    expect(sectionEl).not.toBeNull();
    expect(sectionEl.getAttribute("data-component")).toBe("listbox");
    expect(sectionEl.getAttribute("data-part")).toBe("section");

    expect(sectionLabelEl).not.toBeNull();
    expect(sectionLabelEl.getAttribute("data-component")).toBe("listbox");
    expect(sectionLabelEl.getAttribute("data-part")).toBe("section-label");

    expect(items.length).toBe(2);
    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[1]?.getAttribute("aria-disabled")).toBe("true");
    expect(items[1]?.hasAttribute("data-disabled")).toBe(true);

    expect(itemLabelEl).not.toBeNull();
    expect(itemDescEl).not.toBeNull();
    expect(indicatorEl).not.toBeNull();

    expect(items[0]?.getAttribute("aria-labelledby")).toBe(itemLabelEl.id);
    expect(items[0]?.getAttribute("aria-describedby")).toBe(itemDescEl.id);
  });

  it("supports single selection clicking and firing onChange", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Listbox({
        items: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
          { value: "c", label: "Gamma" },
        ],
        defaultValue: "a",
        onChange,
      }),
    );

    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[1]?.getAttribute("aria-selected")).toBe("false");

    items[1]?.click();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("b");

    expect(items[0]?.getAttribute("aria-selected")).toBe("false");
    expect(items[1]?.getAttribute("aria-selected")).toBe("true");
  });

  it("supports multiple selection mode", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Listbox({
        selectionMode: "multiple",
        items: [
          { value: "red", label: "Red" },
          { value: "green", label: "Green" },
          { value: "blue", label: "Blue" },
        ],
        defaultValue: ["red"],
        onChange,
      }),
    );

    const rootEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    expect(rootEl.getAttribute("aria-multiselectable")).toBe("true");
    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[1]?.getAttribute("aria-selected")).toBe("false");

    // Click second item
    items[1]?.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(["red", "green"]);
    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[1]?.getAttribute("aria-selected")).toBe("true");

    // Toggle first item off
    items[0]?.click();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(["green"]);
    expect(items[0]?.getAttribute("aria-selected")).toBe("false");
    expect(items[1]?.getAttribute("aria-selected")).toBe("true");
  });

  it("supports selectionMode='none'", () => {
    const root = setup(() =>
      Listbox({
        selectionMode: "none",
        items: [
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
        ],
      }),
    );

    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];
    expect(items[0]?.hasAttribute("aria-selected")).toBe(false);
    expect(items[1]?.hasAttribute("aria-selected")).toBe(false);
  });

  it("skips disabled options and ignores clicks on disabled items", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Listbox({
        items: [
          { value: "1", label: "One" },
          { value: "2", label: "Two", disabled: true },
          { value: "3", label: "Three" },
        ],
        defaultValue: "1",
        onChange,
      }),
    );

    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];
    const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;

    items[1]?.click();
    expect(onChange).not.toHaveBeenCalled();
    expect(items[1]?.getAttribute("aria-selected")).toBe("false");

    // Test roving focus skipping disabled item
    items[0]?.focus();
    listboxEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

    expect(getDocument().activeElement).toBe(items[2]);
  });

  it("supports keyboard navigation with ArrowDown, ArrowUp, Home, End, and Enter", () => {
    if (isSSR) return;

    const onChange = vi.fn();
    const root = setup(() =>
      Listbox({
        items: [
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
          { value: "3", label: "Three" },
        ],
        onChange,
      }),
    );

    const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    // Focus listbox root
    listboxEl.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(getDocument().activeElement).toBe(items[0]);

    // Navigate down
    items[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[1]);

    // Navigate up
    items[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[0]);

    // End key
    items[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[2]);

    // Home key
    items[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[0]);

    // Enter to select
    items[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("1");
    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
  });

  it("wraps around start and end when shouldFocusWrap is true", () => {
    if (isSSR) return;

    const root = setup(() =>
      Listbox({
        shouldFocusWrap: true,
        items: [
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
          { value: "3", label: "Three" },
        ],
      }),
    );

    const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    items[0]?.focus();
    listboxEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[2]);

    items[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[0]);
  });

  it("supports horizontal orientation with ArrowRight and ArrowLeft", () => {
    if (isSSR) return;

    const root = setup(() =>
      Listbox({
        orientation: "horizontal",
        items: [
          { value: "1", label: "One" },
          { value: "2", label: "Two" },
          { value: "3", label: "Three" },
        ],
      }),
    );

    const rootEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    expect(rootEl.getAttribute("data-orientation")).toBe("horizontal");
    expect(rootEl.getAttribute("aria-orientation")).toBe("horizontal");

    items[0]?.focus();
    items[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[1]);

    items[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(getDocument().activeElement).toBe(items[0]);
  });

  it("supports controlled value via Value observable", () => {
    if (isSSR) return;

    const selectedVal = createValue("react", { id: "test-controlled-val" });
    const root = setup(() =>
      Listbox({
        value: selectedVal,
        items: [
          { value: "react", label: "React" },
          { value: "solid", label: "Solid" },
          { value: "seidr", label: "Seidr" },
        ],
      }),
    );

    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[2]?.getAttribute("aria-selected")).toBe("false");

    selectedVal("seidr");

    expect(items[0]?.getAttribute("aria-selected")).toBe("false");
    expect(items[2]?.getAttribute("aria-selected")).toBe("true");
  });

  it("supports typeahead search navigation", () => {
    if (isSSR) return;

    const root = setup(() =>
      Listbox({
        items: [
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ],
      }),
    );

    const listboxEl = root.querySelector("[role='listbox']") as HTMLElement;
    const items = Array.from(root.querySelectorAll("[role='option']")) as HTMLElement[];

    items[0]?.focus();
    listboxEl.dispatchEvent(new KeyboardEvent("keydown", { key: "c", bubbles: true }));

    expect(getDocument().activeElement).toBe(items[2]);
  });

  it("should have no accessibility violations (axe)", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Listbox({
        ariaLabel: "Framework options",
        items: [
          { value: "react", label: "React" },
          { value: "solid", label: "Solid" },
          { value: "seidr", label: "Seidr" },
        ],
        defaultValue: "seidr",
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});
