import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mountList } from "./mount-list";

describe("mountList", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = $("div");
  });

  it("should render initial list of items", () => {
    const items = new Seidr([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = $("li");
          el.textContent = item.name;
          return el;
        })(),
      container,
    );

    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe("Item 1");
    expect(container.children[1].textContent).toBe("Item 2");
  });

  it("should add new items when array grows", () => {
    const items = new Seidr([{ id: 1, name: "Item 1" }]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = $("li");
          el.textContent = item.name;
          return el;
        })(),
      container,
    );

    expect(container.children.length).toBe(1);

    items.value = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ];

    expect(container.children.length).toBe(2);
    expect(container.children[1].textContent).toBe("Item 2");
  });

  it("should remove items when array shrinks", () => {
    const items = new Seidr([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = $("li");
          el.textContent = item.name;
          return el;
        })(),
      container,
    );

    expect(container.children.length).toBe(3);

    items.value = [
      { id: 1, name: "Item 1" },
      { id: 3, name: "Item 3" },
    ];

    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe("Item 1");
    expect(container.children[1].textContent).toBe("Item 3");
  });

  it("should reorder items when order changes", () => {
    const items = new Seidr([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = $("li");
          el.textContent = item.name;
          return el;
        })(),
      container,
    );

    expect(container.children[0].textContent).toBe("Item 1");
    expect(container.children[1].textContent).toBe("Item 2");

    items.value = [
      { id: 2, name: "Item 2" },
      { id: 1, name: "Item 1" },
    ];

    expect(container.children[0].textContent).toBe("Item 2");
    expect(container.children[1].textContent).toBe("Item 1");
  });

  it("should clean up when destroyed", () => {
    const items = new Seidr([{ id: 1, name: "Item 1" }]);
    let componentDestroyed = false;

    const cleanup = mountList(
      items,
      (item) => item.id,
      (item) => {
        const comp = component(() => {
          const el = $("li");
          el.textContent = item.name;
          return el;
        })();
        const originalDestroy = comp.destroy;
        comp.destroy = () => {
          componentDestroyed = true;
          originalDestroy();
        };
        return comp;
      },
      container,
    );

    expect(container.children.length).toBe(1);
    expect(componentDestroyed).toBe(false);

    cleanup();

    expect(container.children.length).toBe(0);
    expect(componentDestroyed).toBe(true);
  });

  it("should support raw functions as component factories", () => {
    const todos = new Seidr<{ id: number; text: string }[]>([
      { id: 1, text: "A" },
      { id: 2, text: "B" },
    ]);

    mountList(
      todos,
      (t) => t.id,
      (t) => $("div", { textContent: t.text }),
      container,
    );

    expect(container.textContent).toBe("AB");

    // Clear and check
    todos.value = [];
    expect(container.textContent).toBe("");
  });
});
