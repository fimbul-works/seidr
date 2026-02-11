import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { mount, SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../dom/internal";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { List } from "./list";

describeDualMode("List Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;
  let cleanup: CleanupFunction;

  beforeEach(() => {
    const doc = getDOMFactory().getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    cleanup?.();
  });

  it("should render and update list items efficiently", () => {
    const items = new Seidr([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);
    const Item = component((props: { text: string }) => $("span", { textContent: props.text }));

    const Parent = component(() => {
      return $("div", { className: "parent" }, [
        List(
          items,
          (i) => i.id,
          (i) => Item(i),
        ),
      ]);
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

  it("should call onAttached when components are added to the list", () => {
    const onAttached = vi.fn();
    const items = new Seidr([{ id: 1, text: "A" }]);

    const Item = component((props: { id: number }) => {
      const scope = useScope();
      scope.onAttached = (parent) => onAttached(props.id, parent);
      return $("span", { textContent: `Item ${props.id}` });
    }, "Item");

    const Parent = () => {
      return $("div", { className: "parent" }, [
        List(
          items,
          (i) => i.id,
          Item,
        ),
      ]);
    };

    cleanup = mount(Parent, container);

    expect(onAttached).toHaveBeenCalledWith(1, expect.anything());
    onAttached.mockClear();

    // Add another item
    items.value = [...items.value, { id: 2, text: "B" }];
    expect(onAttached).toHaveBeenCalledWith(2, expect.anything());
  });

  it("should destroy scopes of removed items", () => {
    const items = new Seidr([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);
    const destroyedIds: number[] = [];

    const Item = (props: { id: number }) => {
      const scope = useScope();
      scope.track(() => destroyedIds.push(props.id));
      return $("span", { textContent: `Item ${props.id}` });
    };

    const Parent = () =>
      $("div", {}, [
        List(
          items,
          (i) => i.id,
          (i) => Item(i),
        ),
      ]);

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
      List(
        items,
        (i) => i.id,
        (i) => Item(i),
      ),
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

    // Reorder
    items.value = [
      { id: 1, text: "One" },
      { id: 2, text: "Two" },
    ];
    expect(container.textContent).toBe("OneTwo");
  });
});
