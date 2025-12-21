import { beforeEach, describe, expect, it } from "vitest";
import { component } from "./component.js";
import { createElement } from "./element.js";
import { mount, mountConditional, mountList, mountSwitch } from "./mount.js";
import { ObservableValue } from "./value.js";

describe("mount", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createElement("div");
  });

  it("should mount component into container", () => {
    const mockElement = createElement("div");
    const comp = component(() => mockElement);

    mount(comp, container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should return unmount function", () => {
    const mockElement = createElement("div");
    const comp = component(() => mockElement);

    const unmount = mount(comp, container);

    expect(typeof unmount).toBe("function");
    expect(container.contains(mockElement)).toBe(true);

    unmount();

    expect(container.contains(mockElement)).toBe(false);
  });
});

describe("mountConditional", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createElement("div");
  });

  it("should mount component when condition is true", () => {
    const condition = new ObservableValue(true);
    const mockElement = createElement("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should not mount component when condition is false", () => {
    const condition = new ObservableValue(false);
    const mockElement = createElement("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should toggle component based on condition changes", () => {
    const condition = new ObservableValue(false);
    const mockElement = createElement("div");

    mountConditional(condition, () => component(() => mockElement), container);

    expect(container.contains(mockElement)).toBe(false);

    condition.value = true;

    expect(container.contains(mockElement)).toBe(true);

    condition.value = false;

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should clean up when destroyed", () => {
    const condition = new ObservableValue(true);
    const mockElement = createElement("div");
    let componentDestroyed = false;

    const cleanup = mountConditional(
      condition,
      () => {
        const comp = component(() => mockElement);
        // Override destroy to track if it was called
        const originalDestroy = comp.destroy;
        comp.destroy = () => {
          componentDestroyed = true;
          originalDestroy();
        };
        return comp;
      },
      container,
    );

    expect(container.contains(mockElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    cleanup();

    expect(container.contains(mockElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });
});

describe("mountList", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createElement("div");
  });

  it("should render initial list of items", () => {
    const items = new ObservableValue([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = createElement("li");
          el.textContent = item.name;
          return el;
        }),
      container,
    );

    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe("Item 1");
    expect(container.children[1].textContent).toBe("Item 2");
  });

  it("should add new items when array grows", () => {
    const items = new ObservableValue([{ id: 1, name: "Item 1" }]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = createElement("li");
          el.textContent = item.name;
          return el;
        }),
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
    const items = new ObservableValue([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = createElement("li");
          el.textContent = item.name;
          return el;
        }),
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
    const items = new ObservableValue([
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) =>
        component(() => {
          const el = createElement("li");
          el.textContent = item.name;
          return el;
        }),
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
    const items = new ObservableValue([{ id: 1, name: "Item 1" }]);
    let componentDestroyed = false;

    const cleanup = mountList(
      items,
      (item) => item.id,
      (item) => {
        const comp = component(() => {
          const el = createElement("li");
          el.textContent = item.name;
          return el;
        });
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
});

describe("mountSwitch", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createElement("div");
  });

  it("should render component based on initial value", () => {
    const mode = new ObservableValue<"list" | "grid">("list");
    const listElement = createElement("div");
    const gridElement = createElement("div");

    mountSwitch(
      mode,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement),
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);
  });

  it("should switch components when observable value changes", () => {
    const mode = new ObservableValue<"list" | "grid">("list");
    const listElement = createElement("div");
    const gridElement = createElement("div");

    mountSwitch(
      mode,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement),
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);

    mode.value = "grid";

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(true);
  });

  it("should handle missing component factories gracefully", () => {
    const mode = new ObservableValue<"list" | "grid" | "unknown">("unknown" as const);
    const listElement = createElement("div");
    const gridElement = createElement("div");

    // Use type assertion to allow 'unknown' key
    mountSwitch(
      mode as ObservableValue<"list" | "grid">,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement),
      },
      container,
    );

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(false);
    expect(container.children.length).toBe(0);
  });

  it("should clean up when destroyed", () => {
    const mode = new ObservableValue<"list" | "grid">("list");
    const listElement = createElement("div");
    let componentDestroyed = false;

    const cleanup = mountSwitch(
      mode,
      {
        list: () => {
          const comp = component(() => listElement);
          const originalDestroy = comp.destroy;
          comp.destroy = () => {
            componentDestroyed = true;
            originalDestroy();
          };
          return comp;
        },
        grid: () => component(() => createElement("div")),
      },
      container,
    );

    expect(container.contains(listElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    cleanup();

    expect(container.contains(listElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });
});
