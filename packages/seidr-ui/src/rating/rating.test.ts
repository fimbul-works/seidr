import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createRating, Rating } from "./index.js";

describeDualMode("Rating", ({ getDocument, isSSR }) => {
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
      Rating({
        id: "test-rating",
        name: "product-score",
        defaultValue: 3,
        label: "Product Rating",
        description: "Choose a score between 1 and 5",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("role")).toBe("radiogroup");
    expect(rootEl.getAttribute("data-component")).toBe("rating");
    expect(rootEl.getAttribute("data-orientation")).toBe("horizontal");

    const label = root.querySelector("[data-part='label']") as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toBe("Product Rating");

    const desc = root.querySelector("[data-part='description']") as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe("Choose a score between 1 and 5");

    const items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(5);

    // Initial value is 3: items 1, 2, 3 checked, 4 and 5 unchecked
    expect(items[0].getAttribute("data-state")).toBe("checked");
    expect(items[1].getAttribute("data-state")).toBe("checked");
    expect(items[2].getAttribute("data-state")).toBe("checked");
    expect(items[3].getAttribute("data-state")).toBe("unchecked");
    expect(items[4].getAttribute("data-state")).toBe("unchecked");

    expect(items[2].getAttribute("aria-checked")).toBe("true");
    expect(String(items[2].getAttribute("tabindex"))).toBe("0");
    expect(String(items[3].getAttribute("tabindex"))).toBe("-1");

    const hiddenInput = root.querySelector("input") as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.name).toBe("product-score");
    expect(hiddenInput.value).toBe("3");
  });

  it("supports fine-grained composition via createRating (Tier 2)", () => {
    let ratingInst!: ReturnType<typeof createRating>;

    const root = setup(() => {
      ratingInst = createRating({
        id: "custom-rating",
        max: 3,
        defaultValue: 2,
      });

      return ratingInst.Root({}, [
        ratingInst.Label({}, "Custom Score"),
        ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1, fullIcon: "🔥" })),
        ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2, fullIcon: "🔥" })),
        ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3, fullIcon: "🔥" })),
        ratingInst.HiddenInput(),
      ]);
    });

    const items = root.querySelectorAll("[data-part='item']");
    expect(items.length).toBe(3);
    expect(items[0].getAttribute("data-state")).toBe("checked");
    expect(items[1].getAttribute("data-state")).toBe("checked");
    expect(items[2].getAttribute("data-state")).toBe("unchecked");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("commits rating value on click", () => {
        const changeSpy = vi.fn();
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "click-rating",
            defaultValue: 1,
            onChange: changeSpy,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
            ratingInst.Item({ value: 4 }, ratingInst.ItemIndicator({ itemValue: 4 })),
            ratingInst.Item({ value: 5 }, ratingInst.ItemIndicator({ itemValue: 5 })),
            ratingInst.HiddenInput(),
          ]);
        });

        const items = root.querySelectorAll("[data-part='item']");
        const item4 = items[3] as HTMLElement;

        item4.click();
        expect(ratingInst.value()).toBe(4);
        expect(changeSpy).toHaveBeenCalledWith(4);
        expect(items[3].getAttribute("data-state")).toBe("checked");
        expect(items[4].getAttribute("data-state")).toBe("unchecked");

        const hiddenInput = root.querySelector("input") as HTMLInputElement;
        expect(hiddenInput.value).toBe("4");
      });

      it("supports clearable rating on clicking active item", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "clear-rating",
            defaultValue: 3,
            allowClear: true,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
          ]);
        });

        const items = root.querySelectorAll("[data-part='item']");
        const item3 = items[2] as HTMLElement;

        expect(ratingInst.value()).toBe(3);

        // Clicking the currently active rating resets it to 0
        item3.click();
        expect(ratingInst.value()).toBe(0);
        expect(items[0].getAttribute("data-state")).toBe("unchecked");
        expect(items[1].getAttribute("data-state")).toBe("unchecked");
        expect(items[2].getAttribute("data-state")).toBe("unchecked");
      });

      it("previews rating on hover and restores committed value on pointer leave", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "hover-rating",
            defaultValue: 1,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
          ]);
        });

        const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
        const items = root.querySelectorAll("[data-part='item']");
        const item3 = items[2] as HTMLElement;

        // Hover over item 3
        item3.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 100 }));
        expect(ratingInst.hoveredValue()).toBe(3);
        expect(items[0].getAttribute("data-highlighted")).toBe("");
        expect(items[1].getAttribute("data-highlighted")).toBe("");
        expect(items[2].getAttribute("data-highlighted")).toBe("");

        // Pointer leaves root container -> restores committed value (1)
        rootEl.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
        expect(ratingInst.hoveredValue()).toBeNull();
        expect(ratingInst.value()).toBe(1);
        expect(items[0].getAttribute("data-state")).toBe("checked");
        expect(items[1].getAttribute("data-state")).toBe("unchecked");
      });

      it("supports half-star precision when allowHalf is true", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "half-rating",
            defaultValue: 0,
            allowHalf: true,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
          ]);
        });

        const items = root.querySelectorAll("[data-part='item']");
        const item2 = items[1] as HTMLElement;

        // Mock getBoundingClientRect
        vi.spyOn(item2, "getBoundingClientRect").mockReturnValue({
          left: 100,
          right: 200,
          top: 0,
          bottom: 50,
          width: 100,
          height: 50,
          x: 100,
          y: 0,
          toJSON: () => {},
        });

        // Pointer move on left half of item 2 (clientX 120 < 100 + 50)
        item2.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 120 }));
        expect(ratingInst.hoveredValue()).toBe(1.5);
        expect(items[0].getAttribute("data-state")).toBe("checked");
        expect(items[1].getAttribute("data-state")).toBe("half");

        // Click commits the half rating
        item2.click();
        expect(ratingInst.value()).toBe(1.5);
        expect(items[1].getAttribute("data-state")).toBe("half");
      });

      it("supports keyboard navigation with arrow keys, Home, and End", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "keyboard-rating",
            defaultValue: 2,
            max: 5,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
            ratingInst.Item({ value: 4 }, ratingInst.ItemIndicator({ itemValue: 4 })),
            ratingInst.Item({ value: 5 }, ratingInst.ItemIndicator({ itemValue: 5 })),
          ]);
        });

        const rootEl = root.querySelector("[data-part='root']") as HTMLElement;

        // ArrowRight increments
        rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        expect(ratingInst.value()).toBe(3);

        // ArrowLeft decrements
        rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
        expect(ratingInst.value()).toBe(2);

        // End sets to max (5)
        rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        expect(ratingInst.value()).toBe(5);

        // Home sets to 0
        rootEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
        expect(ratingInst.value()).toBe(0);
      });

      it("respects disabled and readOnly states", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const root = setup(() => {
          ratingInst = createRating({
            id: "disabled-rating",
            defaultValue: 3,
            disabled: true,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
          ]);
        });

        const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
        expect(rootEl.getAttribute("data-disabled")).toBe("");

        const items = root.querySelectorAll("[data-part='item']");
        (items[0] as HTMLElement).click();
        expect(ratingInst.value()).toBe(3);

        (items[0] as HTMLElement).dispatchEvent(
          new PointerEvent("pointermove", { bubbles: true, clientX: 10 }),
        );
        expect(ratingInst.hoveredValue()).toBeNull();
      });

      it("resets to defaultValue when parent form resets", () => {
        let ratingInst!: ReturnType<typeof createRating>;

        const form = getDocument().createElement("form");
        getDocument().body.appendChild(form);

        target = getDocument().createElement("div");
        form.appendChild(target);

        const App = createComponent(() => {
          ratingInst = createRating({
            id: "form-rating",
            defaultValue: 2,
          });

          return ratingInst.Root({}, [
            ratingInst.Item({ value: 1 }, ratingInst.ItemIndicator({ itemValue: 1 })),
            ratingInst.Item({ value: 2 }, ratingInst.ItemIndicator({ itemValue: 2 })),
            ratingInst.Item({ value: 3 }, ratingInst.ItemIndicator({ itemValue: 3 })),
          ]);
        });

        unmount = mount(App, target);

        // Mutate rating to 3
        ratingInst.setValue(3);
        expect(ratingInst.value()).toBe(3);

        // Dispatch form reset
        form.reset();
        expect(ratingInst.value()).toBe(2);

        form.remove();
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          Rating({
            id: "axe-rating",
            name: "a11y-score",
            defaultValue: 4,
            label: "Review Rating",
            description: "Star rating accessible to assistive technologies",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
