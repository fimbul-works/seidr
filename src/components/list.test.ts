import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { mount } from "../dom";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { List } from "./list";

describeDualMode("List Component", ({ getDocument }) => {
  let container: HTMLDivElement;
  let cleanup: CleanupFunction;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    cleanup?.();
  });

  it("should render and update list items efficiently", () => {
    type Item = { id: number; text: string };
    const items = new Seidr<Item[]>([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);
    const Item = component((props: { text: string }) => $("span", { textContent: props.text }));

    const Parent = component(() => {
      return $("div", { className: "parent" }, [List(items, (i) => i.id, Item)]);
    });

    const parent = Parent();
    cleanup = mount(parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.querySelectorAll("span").length).toBe(2);
    expect(parentEl.innerHTML).toContain("A");
    expect(parentEl.innerHTML).toContain("B");
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}List-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}List-`);

    // Update list
    items.value = [
      { id: 2, text: "B" },
      { id: 3, text: "C" },
    ];
    expect(parentEl.querySelectorAll("span").length).toBe(2);

    const spanTexts = Array.from(parentEl.querySelectorAll("span")).map((s) => s.textContent);
    expect(spanTexts).not.toContain("A");
    expect(spanTexts).toContain("B");
    expect(spanTexts).toContain("C");

    // Reorder
    items.value = [
      { id: 3, text: "C" },
      { id: 2, text: "B" },
    ];
    const spans = parentEl.querySelectorAll("span");
    expect(spans[0].textContent).toBe("C");
    expect(spans[1].textContent).toBe("B");
  });

  it("should call onMount when components are added to the list", () => {
    const onMountFn = vi.fn();
    const items = new Seidr([{ id: 1, text: "A" }]);

    const Item = component((props: { id: number }) => {
      useScope().onMount((parent) => onMountFn(props.id, parent));
      return $("span", { textContent: `Item ${props.id}` });
    }, "Item");

    const Parent = () => {
      return $("div", { className: "parent" }, [List(items, (i) => i.id, Item)]);
    };

    cleanup = mount(Parent, container);

    expect(onMountFn).toHaveBeenCalledWith(1, expect.anything());
    onMountFn.mockClear();

    // Add another item
    items.value = [...items.value, { id: 2, text: "B" }];
    expect(onMountFn).toHaveBeenCalledWith(2, expect.anything());
  });

  it("should destroy scopes of removed items", () => {
    const items = new Seidr([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);
    const destroyedIds: number[] = [];

    const Item = (props: { id: number }) => {
      useScope().onUnmount(() => destroyedIds.push(props.id));
      return $("span", { textContent: `Item ${props.id}` });
    };

    const Parent = () => $("div", {}, [List(items, (i) => i.id, Item)]);

    cleanup = mount(Parent, container);

    // Remove item 1
    items.value = [{ id: 2, text: "B" }];
    expect(destroyedIds).toContain(1);
    expect(destroyedIds).not.toContain(2);

    // Remove item 2
    items.value = [];
    expect(destroyedIds).toContain(2);
  });

  it("should respond to observable changes immediately by re-rendering", () => {
    const items = new Seidr([{ id: 1, text: "Initial" }]);
    const Item = (props: { text: string }) => $("span", { textContent: props.text });

    cleanup = mount(
      List(items, (i) => i.id, Item),
      container,
    );

    expect(container.textContent).toBe("Initial");

    // Immediate update (change IDs to trigger new components)
    items.value = [
      { id: 3, text: "Updated" },
      { id: 2, text: "New" },
    ];
    expect(container.textContent).toBe("UpdatedNew");

    // Removal
    items.value = [{ id: 4, text: "Only New" }];
    expect(container.textContent).toBe("Only New");

    items.value = [
      { id: 1, text: "One" },
      { id: 2, text: "Two" },
    ];
    expect(container.textContent).toBe("OneTwo");
  });

  it("should update element reference when list changes", () => {
    const items = new Seidr([{ id: 1, text: "A" }]);
    const Item = component((props: { text: string }) => $("span", { textContent: props.text }), "Item");
    const list = List(items, (i) => i.id, Item);

    cleanup = mount(() => list, container);

    expect(Array.isArray(list.element)).toBe(true);
    expect((list.element as any[]).length).toBe(1);

    items.value = [
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ];
    expect((list.element as any[]).length).toBe(2);
  });

  describeDualMode("Deep-dive reordering and edge cases", () => {
    it("should move DOM nodes instead of recreating them during reorder", () => {
      const items = new Seidr([
        { id: 1, text: "1" },
        { id: 2, text: "2" },
      ]);
      const Item = component((props: { text: string }) => $("span", { textContent: props.text }));
      const list = List(items, (i) => i.id, Item);

      cleanup = mount(() => list, container);

      const firstSpan = container.querySelector("span")!;
      expect(firstSpan.textContent).toBe("1");

      // Reorder
      items.value = [
        { id: 2, text: "2" },
        { id: 1, text: "1" },
      ];

      const spansAfter = container.querySelectorAll("span");
      expect(spansAfter[1]).toBe(firstSpan); // Same DOM node, but now at index 1
      expect(spansAfter[1].textContent).toBe("1");
    });

    it("should handle updates when the list is not yet in the DOM", () => {
      // This tests the if (!parent) return; branch in update
      const items = new Seidr([{ id: 1, text: "A" }]);
      const Item = component((props: { text: string }) => $("span", { textContent: props.text }));
      const list = List(items, (i) => i.id, Item);

      // List is initialized but not mounted
      expect(items.observerCount()).toBe(1);

      // Update items before mounting
      expect(() => {
        items.value = [{ id: 2, text: "B" }];
      }).not.toThrow();

      // Now mount and verify it gets the latest value (from initial render of the component factory)
      cleanup = mount(() => list, container);
      expect(container.textContent).toBe("B");
    });

    it("should support removal of multiple items", () => {
      const items = new Seidr([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const list = List(
        items,
        (i) => i.id,
        () => $("div"),
      );
      cleanup = mount(list, container);
      expect(container.querySelectorAll("div").length).toBe(3);

      items.value = [{ id: 2 }];
      expect(container.querySelectorAll("div").length).toBe(1);
    });
  });
});
