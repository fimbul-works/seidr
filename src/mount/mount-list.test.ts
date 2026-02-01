import { beforeEach, describe, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { $, type SeidrElement } from "../element";
import { Seidr } from "../seidr";
import { mountList } from "./mount-list";

describe("mountList", () => {
  let container: SeidrElement;

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
        const originalRemove = comp.element.remove.bind(comp);
        comp.element.remove = () => {
          componentDestroyed = true;
          originalRemove();
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

  it("should cleanup all reactive observers after unmount", () => {
    const list = new Seidr([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);
    const textA = new Seidr("content A");
    const textB = new Seidr("content B");

    expect(list.observerCount()).toBe(0);
    expect(textA.observerCount()).toBe(0);

    const cleanup = mountList(
      list,
      (item) => item.id,
      (item) => {
        const text = item.id === 1 ? textA : textB;
        return $("div", { textContent: text });
      },
      container,
    );

    expect(list.observerCount()).toBe(1);
    expect(textA.observerCount()).toBe(1);
    expect(textB.observerCount()).toBe(1);

    cleanup();

    expect(list.observerCount()).toBe(0);
    expect(textA.observerCount()).toBe(0);
    expect(textB.observerCount()).toBe(0);
  });

  it("should cleanup observers when individual items are removed", () => {
    const list = new Seidr([{ id: 1 }, { id: 2 }]);
    const text1 = new Seidr("1");
    const text2 = new Seidr("2");

    mountList(
      list,
      (item) => item.id,
      (item) => $("div", { textContent: item.id === 1 ? text1 : text2 }),
      container,
    );

    expect(text1.observerCount()).toBe(1);
    expect(text2.observerCount()).toBe(1);

    // Remove item 1
    list.value = [{ id: 2 }];
    expect(text1.observerCount()).toBe(0);
    expect(text2.observerCount()).toBe(1);
  });

  it("should call onAttached when components are added", () => {
    const onAttached = vi.fn();
    const items = new Seidr([{ id: 1 }]);

    mountList(
      items,
      (item) => item.id,
      (item) => {
        const scope = useScope();
        scope.onAttached = (parent) => onAttached(item.id, parent);
        return $("div");
      },
      container,
    );

    expect(onAttached).toHaveBeenCalledWith(1, expect.anything());
    onAttached.mockClear();

    items.value = [{ id: 1 }, { id: 2 }];
    expect(onAttached).toHaveBeenCalledWith(2, expect.anything());
  });
});
