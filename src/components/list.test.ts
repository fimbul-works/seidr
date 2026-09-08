import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent, onUnmounted } from "../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { mount } from "../dom";
import { $ } from "../element";
import { createValue, type Value } from "../observable";
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
    container?.remove();
  });

  it("should render and update list items efficiently", () => {
    type Item = { id: number; text: string };
    const items = createValue<Item[]>([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);

    const ItemView = (props: Value<Item>) => $("span", { textContent: props.as((p) => p.text) });

    const Parent = () => $("div", { className: "parent" }, [List(items, (i) => i.id, ItemView)]);

    cleanup = mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.querySelectorAll("span").length).toBe(2);
    expect(parentEl.innerHTML).toContain("A");
    expect(parentEl.innerHTML).toContain("B");
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}List`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}List`);

    // Update list: remove A, keep B, add C
    items([
      { id: 2, text: "B" },
      { id: 3, text: "C" },
    ]);
    expect(parentEl.querySelectorAll("span").length).toBe(2);

    const spanTexts = Array.from(parentEl.querySelectorAll("span")).map((s) => s.textContent);
    expect(spanTexts).not.toContain("A");
    expect(spanTexts).toContain("B");
    expect(spanTexts).toContain("C");

    // Reorder: C then B
    items([
      { id: 3, text: "C" },
      { id: 2, text: "B" },
    ]);
    const spans = parentEl.querySelectorAll("span");
    expect(spans[0].textContent).toBe("C");
    expect(spans[1].textContent).toBe("B");
  });

  it("should destroy scopes of removed items", () => {
    const items = createValue([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);
    const destroyedIds: number[] = [];

    const ItemView = (props: Value<{ id: number; text: string }>) =>
      createComponent(() => {
        onUnmounted(() => destroyedIds.push(props().id));
        return $("span", { textContent: props.as((p) => `Item ${p.id}`) });
      })();

    const Parent = () => $("div", {}, [List(items, (i) => i.id, ItemView)]);

    cleanup = mount(Parent, container);

    // Remove item 1
    items([{ id: 2, text: "B" }]);
    expect(destroyedIds).toContain(1);
    expect(destroyedIds).not.toContain(2);

    // Remove item 2
    items([]);
    expect(destroyedIds).toContain(2);
  });

  it("should move DOM nodes instead of recreating them during reorder", () => {
    const items = createValue([
      { id: 1, text: "1" },
      { id: 2, text: "2" },
    ]);

    const ItemView = (props: Value<{ id: number; text: string }>) =>
      $("span", { textContent: props.as((p) => p.text) });

    cleanup = mount(() => List(items, (i) => i.id, ItemView), container);

    const firstSpan = container.querySelector("span")!;
    expect(firstSpan.textContent).toBe("1");

    // Reorder
    items([
      { id: 2, text: "2" },
      { id: 1, text: "1" },
    ]);

    const spansAfter = container.querySelectorAll("span");
    expect(spansAfter[1]).toBe(firstSpan); // Same DOM node, moved to index 1
    expect(spansAfter[1].textContent).toBe("1");
    expect(spansAfter[0].textContent).toBe("2");
  });

  it("should support item property updates through itemValue without full rebuild", () => {
    const items = createValue([{ id: 1, text: "Original" }]);

    const ItemView = (props: Value<{ id: number; text: string }>) =>
      $("span", { textContent: props.as((p) => p.text) });

    cleanup = mount(() => List(items, (i) => i.id, ItemView), container);

    const span = container.querySelector("span")!;
    expect(span.textContent).toBe("Original");

    // Update item text with same id
    items([{ id: 1, text: "Updated" }]);

    expect(container.querySelector("span")).toBe(span); // Same DOM node
    expect(span.textContent).toBe("Updated");
  });

  it("should handle nullish or empty updates gracefully", () => {
    const items = createValue<Array<{ id: number; text: string }>>([{ id: 1, text: "Item 1" }]);

    const ItemView = (props: Value<{ id: number; text: string }>) =>
      $("span", { textContent: props.as((p) => p?.text ?? "") });

    cleanup = mount(() => List(items, (i) => i.id, ItemView), container);
    expect(container.querySelectorAll("span").length).toBe(1);

    // Update with empty array
    items([]);
    expect(container.querySelectorAll("span").length).toBe(0);

    // Update with undefined / nullish through any cast
    (items as any)(undefined);
    expect(container.querySelectorAll("span").length).toBe(0);
  });
});
