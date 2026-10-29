import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createToggleGroup, ToggleGroup } from "./index.js";

describeDualMode("ToggleGroup", ({ getDocument, isSSR }) => {
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
    const root = setup(() => {
      const group = createToggleGroup({ id: "test-toggle-group", defaultValue: "cats" });
      return group.Root({}, [
        group.Item({ value: "dogs" }, "Dogs"),
        group.Item({ value: "cats" }, "Cats"),
        group.Item({ value: "dragons" }, "Dragons"),
      ]);
    });

    const groupEl = root.querySelector("[role='group']") as HTMLElement;
    const items = root.querySelectorAll("[data-part='item']");

    expect(groupEl).not.toBeNull();
    expect(items.length).toBe(3);

    // Semantic data attributes
    expect(groupEl.getAttribute("data-component")).toBe("toggle-group");
    expect(groupEl.getAttribute("data-part")).toBe("root");
    expect(groupEl.getAttribute("data-orientation")).toBe("horizontal");

    expect(items[0]?.getAttribute("data-component")).toBe("toggle-group");
    expect(items[0]?.getAttribute("data-part")).toBe("item");
    expect(items[0]?.getAttribute("aria-pressed")).toBe("false");
    expect(items[0]?.hasAttribute("data-pressed")).toBe(false);

    expect(items[1]?.getAttribute("aria-pressed")).toBe("true");
    expect(items[1]?.hasAttribute("data-pressed")).toBe(true);

    expect(items[2]?.getAttribute("aria-pressed")).toBe("false");
  });

  it("supports single selection clicking and toggling off", () => {
    if (isSSR) return;
    const onChange = vi.fn();
    const root = setup(() =>
      ToggleGroup({
        id: "tg-single",
        defaultValue: "cats",
        onChange,
        items: [
          { value: "dogs", label: "Dogs" },
          { value: "cats", label: "Cats" },
          { value: "dragons", label: "Dragons" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']");
    const dragonsBtn = items[2] as HTMLButtonElement;
    const catsBtn = items[1] as HTMLButtonElement;

    expect(catsBtn.getAttribute("aria-pressed")).toBe("true");
    expect(dragonsBtn.getAttribute("aria-pressed")).toBe("false");

    // Click dragons
    dragonsBtn.click();
    expect(onChange).toHaveBeenCalledWith("dragons");
    expect(dragonsBtn.getAttribute("aria-pressed")).toBe("true");
    expect(catsBtn.getAttribute("aria-pressed")).toBe("false");

    // Click dragons again to toggle off
    dragonsBtn.click();
    expect(onChange).toHaveBeenCalledWith(null);
    expect(dragonsBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("prevents deselecting when disallowEmptySelection is true", () => {
    if (isSSR) return;
    const onChange = vi.fn();
    const root = setup(() =>
      ToggleGroup({
        id: "tg-required",
        defaultValue: "cats",
        disallowEmptySelection: true,
        onChange,
        items: [
          { value: "dogs", label: "Dogs" },
          { value: "cats", label: "Cats" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']");
    const catsBtn = items[1] as HTMLButtonElement;

    expect(catsBtn.getAttribute("aria-pressed")).toBe("true");

    // Clicking already-selected item when disallowEmptySelection=true should remain selected
    catsBtn.click();
    expect(catsBtn.getAttribute("aria-pressed")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports multiple selection", () => {
    if (isSSR) return;
    const onChange = vi.fn();
    const root = setup(() =>
      ToggleGroup({
        id: "tg-multi",
        multiple: true,
        defaultValue: ["bold"],
        onChange,
        items: [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
          { value: "underline", label: "Underline" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']");
    const boldBtn = items[0] as HTMLButtonElement;
    const italicBtn = items[1] as HTMLButtonElement;

    expect(boldBtn.getAttribute("aria-pressed")).toBe("true");
    expect(italicBtn.getAttribute("aria-pressed")).toBe("false");

    // Toggle italic on
    italicBtn.click();
    expect(onChange).toHaveBeenCalledWith(["bold", "italic"]);
    expect(boldBtn.getAttribute("aria-pressed")).toBe("true");
    expect(italicBtn.getAttribute("aria-pressed")).toBe("true");

    // Toggle bold off
    boldBtn.click();
    expect(onChange).toHaveBeenCalledWith(["italic"]);
    expect(boldBtn.getAttribute("aria-pressed")).toBe("false");
    expect(italicBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("respects group disabled and item disabled states", () => {
    if (isSSR) return;
    const onChange = vi.fn();
    const root = setup(() =>
      ToggleGroup({
        id: "tg-disabled-item",
        defaultValue: "left",
        onChange,
        items: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center", disabled: true },
          { value: "right", label: "Right" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']");
    const centerBtn = items[1] as HTMLButtonElement;

    expect(centerBtn.disabled).toBe(true);
    expect(centerBtn.hasAttribute("data-disabled")).toBe(true);

    centerBtn.click();
    expect(onChange).not.toHaveBeenCalled();
    expect(centerBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("handles keyboard roving focus in horizontal orientation", () => {
    if (isSSR) return; // Keyboard focus events require full client DOM

    const root = setup(() =>
      ToggleGroup({
        id: "tg-kbd-h",
        defaultValue: "dogs",
        items: [
          { value: "dogs", label: "Dogs" },
          { value: "cats", label: "Cats" },
          { value: "dragons", label: "Dragons" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']") as NodeListOf<HTMLButtonElement>;
    const [dogs, cats, dragons] = Array.from(items);

    expect(dogs.tabIndex).toBe(0);
    expect(cats.tabIndex).toBe(-1);
    expect(dragons.tabIndex).toBe(-1);

    dogs.focus();

    // ArrowRight moves focus to cats
    dogs.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(cats.tabIndex).toBe(0);
    expect(dogs.tabIndex).toBe(-1);

    // ArrowLeft moves focus back to dogs
    cats.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(dogs.tabIndex).toBe(0);

    // End key moves focus to dragons
    dogs.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(dragons.tabIndex).toBe(0);

    // Home key moves focus to dogs
    dragons.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(dogs.tabIndex).toBe(0);

    // Space activates dogs (toggles it off)
    dogs.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(dogs.getAttribute("aria-pressed")).toBe("false");
  });

  it("handles keyboard roving focus in vertical orientation", () => {
    if (isSSR) return;

    const root = setup(() =>
      ToggleGroup({
        id: "tg-kbd-v",
        orientation: "vertical",
        defaultValue: "one",
        items: [
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
          { value: "three", label: "Three" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']") as NodeListOf<HTMLButtonElement>;
    const [one, two] = Array.from(items);

    one.focus();

    // ArrowDown moves focus to two
    one.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(two.tabIndex).toBe(0);
    expect(one.tabIndex).toBe(-1);

    // ArrowUp moves focus back to one
    two.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(one.tabIndex).toBe(0);
  });

  it("reacts to controlled reactive value updates", () => {
    const controlledVal = createValue<string | null>("alpha", { id: "tg-ctrl-val" });

    const root = setup(() =>
      ToggleGroup({
        id: "tg-reactive",
        value: controlledVal,
        items: [
          { value: "alpha", label: "Alpha" },
          { value: "beta", label: "Beta" },
        ],
      }),
    );

    const items = root.querySelectorAll("[data-part='item']");
    expect(items[0]?.getAttribute("aria-pressed")).toBe("true");
    expect(items[1]?.getAttribute("aria-pressed")).toBe("false");

    controlledVal("beta");

    expect(items[0]?.getAttribute("aria-pressed")).toBe("false");
    expect(items[1]?.getAttribute("aria-pressed")).toBe("true");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      ToggleGroup({
        id: "axe-toggle-group",
        ariaLabel: "Text formatting options",
        defaultValue: "bold",
        items: [
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
          { value: "underline", label: "Underline" },
        ],
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
