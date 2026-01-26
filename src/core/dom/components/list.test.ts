import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { useScope } from "../use-scope";
import { List } from "./list";

describe("List Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
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
    mount(parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.querySelectorAll("span").length).toBe(2);
    expect(parentEl.innerHTML).toContain("A");
    expect(parentEl.innerHTML).toContain("B");
    expect(parentEl.innerHTML).toContain("<!--seidr-list");

    // Update list
    items.value = [
      { id: 2, text: "B" },
      { id: 3, text: "C" },
    ];
    expect(parentEl.querySelectorAll("span").length).toBe(2);

    // Check that "A" element was removed (not just textContent, to avoid false positives from UIDs in comments)
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
    });

    const Parent = component(() => {
      return $("div", { className: "parent" }, [
        List(
          items,
          (i) => i.id,
          (i) => Item(i),
        ),
      ]);
    });

    mount(Parent(), container);

    // Should be called for the first item
    expect(onAttached).toHaveBeenCalledWith(1, expect.anything());
    onAttached.mockClear();

    // Add another item
    items.value = [...items.value, { id: 2, text: "B" }];
    expect(onAttached).toHaveBeenCalledWith(2, expect.anything());
  });
});
