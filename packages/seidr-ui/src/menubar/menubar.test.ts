import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import {
  createMenubar,
  Menubar,
  type MenubarMenuDescriptor,
} from "./index.js";

describeDualMode("Menubar", ({ getDocument, isSSR }) => {
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
      Menubar({
        id: "test-menubar",
        menus: [
          {
            value: "file",
            trigger: "File",
            items: [
              { value: "new", label: "New Window" },
              { value: "open", label: "Open File" },
            ],
          },
          {
            value: "edit",
            trigger: "Edit",
            items: [
              { value: "undo", label: "Undo" },
              { value: "redo", label: "Redo" },
            ],
          },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("role")).toBe("menubar");
    expect(rootEl.getAttribute("aria-orientation")).toBe("horizontal");
    expect(rootEl.getAttribute("data-component")).toBe("menubar");

    const triggers = root.querySelectorAll("[data-part='trigger']");
    expect(triggers.length).toBe(2);

    const trigger1 = triggers[0] as HTMLElement;
    expect(trigger1.getAttribute("role")).toBe("menuitem");
    expect(trigger1.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger1.getAttribute("aria-expanded")).toBe("false");
    expect(trigger1.textContent).toBe("File");
    expect(String(trigger1.getAttribute("tabindex"))).toBe("0");

    const trigger2 = triggers[1] as HTMLElement;
    expect(trigger2.getAttribute("role")).toBe("menuitem");
    expect(trigger2.textContent).toBe("Edit");
    expect(String(trigger2.getAttribute("tabindex"))).toBe("-1");

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports fine-grained composition via createMenubar (Tier 2)", () => {
    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "custom-mb" });
      const fileMenu = menubarInstance.createMenu("file");
      const editMenu = menubarInstance.createMenu("edit");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "Custom File"),
          fileMenu.Content({}, [
            fileMenu.Item({ value: "new" }, "New"),
            fileMenu.Item({ value: "exit" }, "Exit"),
          ]),
        ]),
        menubarInstance.Menu({ value: "edit" }, [
          editMenu.Trigger({}, "Custom Edit"),
          editMenu.Content({}, [
            editMenu.Item({ value: "cut" }, "Cut"),
          ]),
        ]),
      ]);
    });

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();

    const triggers = root.querySelectorAll("[data-part='trigger']");
    expect(triggers.length).toBe(2);
    expect(triggers[0]?.textContent).toBe("Custom File");
    expect(triggers[1]?.textContent).toBe("Custom Edit");
  });

  it("opens menu on trigger click and closes on subsequent click", () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "click-mb" });
      const fileMenu = menubarInstance.createMenu("file");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [
            fileMenu.Item({ value: "new" }, "New"),
          ]),
        ]),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(menubarInstance.isOpen()).toBe(false);

    // Click to open
    trigger.click();
    expect(menubarInstance.isOpen()).toBe(true);
    expect(menubarInstance.value()).toBe("file");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const content = root.querySelector("[data-part='content']") as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.getAttribute("role")).toBe("menu");

    // Click again to close
    trigger.click();
    expect(menubarInstance.isOpen()).toBe(false);
    expect(menubarInstance.value()).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("handles roving tabindex keyboard navigation across triggers (ArrowRight / ArrowLeft / Home / End)", () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "roving-mb" });
      const fileMenu = menubarInstance.createMenu("file");
      const editMenu = menubarInstance.createMenu("edit");
      const viewMenu = menubarInstance.createMenu("view");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [fileMenu.Trigger({}, "File")]),
        menubarInstance.Menu({ value: "edit" }, [editMenu.Trigger({}, "Edit")]),
        menubarInstance.Menu({ value: "view" }, [viewMenu.Trigger({}, "View")]),
      ]);
    });

    const triggers = root.querySelectorAll("[data-part='trigger']");
    const tFile = triggers[0] as HTMLElement;
    const tEdit = triggers[1] as HTMLElement;
    const tView = triggers[2] as HTMLElement;

    expect(tFile.getAttribute("tabindex")).toBe("0");
    expect(tEdit.getAttribute("tabindex")).toBe("-1");
    expect(tView.getAttribute("tabindex")).toBe("-1");

    // ArrowRight moves focus to Edit
    tFile.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("edit");
    expect(tFile.getAttribute("tabindex")).toBe("-1");
    expect(tEdit.getAttribute("tabindex")).toBe("0");

    // ArrowRight moves focus to View
    tEdit.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("view");
    expect(tView.getAttribute("tabindex")).toBe("0");

    // ArrowRight loops back to File
    tView.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("file");
    expect(tFile.getAttribute("tabindex")).toBe("0");

    // ArrowLeft loops back to View
    tFile.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("view");
    expect(tView.getAttribute("tabindex")).toBe("0");

    // Home jumps to File
    tView.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("file");
    expect(tFile.getAttribute("tabindex")).toBe("0");

    // End jumps to View
    tFile.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(menubarInstance.activeTrigger()).toBe("view");
    expect(tView.getAttribute("tabindex")).toBe("0");
  });

  it("opens menu and focuses on ArrowDown / ArrowUp", () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "arrow-open-mb" });
      const fileMenu = menubarInstance.createMenu("file");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [
            fileMenu.Item({ value: "item1" }, "First Item"),
            fileMenu.Item({ value: "item2" }, "Second Item"),
          ]),
        ]),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;

    // ArrowDown opens menu
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(menubarInstance.isOpen()).toBe(true);
    expect(menubarInstance.value()).toBe("file");

    const content = root.querySelector("[data-part='content']") as HTMLElement;
    expect(content).not.toBeNull();
  });

  it("switches menus seamlessly on hover when any menu is open", () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "hover-switch-mb" });
      const fileMenu = menubarInstance.createMenu("file");
      const editMenu = menubarInstance.createMenu("edit");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [fileMenu.Item({ value: "f1" }, "File Item")]),
        ]),
        menubarInstance.Menu({ value: "edit" }, [
          editMenu.Trigger({}, "Edit"),
          editMenu.Content({}, [editMenu.Item({ value: "e1" }, "Edit Item")]),
        ]),
      ]);
    });

    const triggers = root.querySelectorAll("[data-part='trigger']");
    const tFile = triggers[0] as HTMLElement;
    const tEdit = triggers[1] as HTMLElement;

    // When closed, hovering does not open
    tEdit.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(menubarInstance.isOpen()).toBe(false);

    // Open File menu via click
    tFile.click();
    expect(menubarInstance.isOpen()).toBe(true);
    expect(menubarInstance.value()).toBe("file");
    expect(root.textContent).toContain("File Item");

    // Hover over Edit menu trigger -> switches immediately to Edit!
    tEdit.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(menubarInstance.isOpen()).toBe(true);
    expect(menubarInstance.value()).toBe("edit");
    expect(root.textContent).toContain("Edit Item");
  });

  it("switches active menus on ArrowRight / ArrowLeft inside open dropdowns", () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "key-switch-mb" });
      const fileMenu = menubarInstance.createMenu("file");
      const editMenu = menubarInstance.createMenu("edit");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [fileMenu.Item({ value: "f1" }, "File Item")]),
        ]),
        menubarInstance.Menu({ value: "edit" }, [
          editMenu.Trigger({}, "Edit"),
          editMenu.Content({}, [editMenu.Item({ value: "e1" }, "Edit Item")]),
        ]),
      ]);
    });

    const triggers = root.querySelectorAll("[data-part='trigger']");
    const tFile = triggers[0] as HTMLElement;

    tFile.click();
    expect(menubarInstance.value()).toBe("file");

    const content = root.querySelector("[data-part='content']") as HTMLElement;
    content.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(menubarInstance.value()).toBe("edit");

    const editContent = root.querySelector("[data-part='content']") as HTMLElement;
    editContent.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));

    expect(menubarInstance.value()).toBe("file");
  });

  it("closes menubar on Escape and outside pointer interaction", async () => {
    if (isSSR) return;

    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "escape-mb" });
      const fileMenu = menubarInstance.createMenu("file");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [fileMenu.Item({ value: "f1" }, "File Item")]),
        ]),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    trigger.click();
    expect(menubarInstance.isOpen()).toBe(true);

    const content = root.querySelector("[data-part='content']") as HTMLElement;
    content.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(menubarInstance.isOpen()).toBe(false);

    // Outside pointer interaction
    trigger.click();
    expect(menubarInstance.isOpen()).toBe(true);

    // Wait for pointerdown listener in useInteractOutside
    await new Promise((resolve) => setTimeout(resolve, 10));

    const outsideTarget = getDocument().createElement("button");
    getDocument().body.appendChild(outsideTarget);

    outsideTarget.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
    expect(menubarInstance.isOpen()).toBe(false);

    outsideTarget.remove();
  });

  it("executes onSelect and closes menubar on item selection", () => {
    if (isSSR) return;

    const onSelectAction = vi.fn();
    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "select-mb" });
      const fileMenu = menubarInstance.createMenu("file");

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "file" }, [
          fileMenu.Trigger({}, "File"),
          fileMenu.Content({}, [
            fileMenu.Item({ value: "act", onSelect: onSelectAction }, "Perform Action"),
          ]),
        ]),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    trigger.click();

    const item = root.querySelector("[data-part='item']") as HTMLElement;
    item.click();

    expect(onSelectAction).toHaveBeenCalled();
    expect(menubarInstance.isOpen()).toBe(false);
  });

  it("supports CheckboxItem, RadioGroup, and Submenus in Menubar", () => {
    if (isSSR) return;

    const checkedVal = createValue<boolean>(false);
    const radioVal = createValue<string>("1");
    let menubarInstance!: ReturnType<typeof createMenubar>;

    const root = setup(() => {
      menubarInstance = createMenubar({ id: "compound-mb" });
      const viewMenu = menubarInstance.createMenu("view");
      const sub = viewMenu.createSub();
      const radioGroup = viewMenu.createRadioGroup({
        value: radioVal,
        onChange: (v) => radioVal(v),
      });

      return menubarInstance.Root({}, [
        menubarInstance.Menu({ value: "view" }, [
          viewMenu.Trigger({}, "View"),
          viewMenu.Content({}, [
            viewMenu.CheckboxItem(
              {
                value: "chk",
                checked: checkedVal,
                onChange: (c) => checkedVal(c),
              },
              "Toggle Grid",
            ),
            radioGroup.Root({}, [
              radioGroup.Item({ value: "1" }, "Option 1"),
              radioGroup.Item({ value: "2" }, "Option 2"),
            ]),
            viewMenu.Sub({ subInstance: sub }, [
              viewMenu.SubTrigger({ subInstance: sub, value: "more" }, "More >"),
              viewMenu.SubContent({ subInstance: sub }, [
                sub.Item({ value: "deep" }, "Deep Action"),
              ]),
            ]),
          ]),
        ]),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    trigger.click();

    const checkbox = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    checkbox.click();
    expect(checkedVal()).toBe(true);

    const radioItems = root.querySelectorAll("[data-part='radio-item']");
    expect(radioItems[0]?.getAttribute("aria-checked")).toBe("true");
    (radioItems[1] as HTMLElement).click();
    expect(radioVal()).toBe("2");
  });

  it("should have no accessibility violations (axe)", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Menubar({
        id: "a11y-mb",
        menus: [
          {
            value: "file",
            trigger: "File",
            items: [
              { value: "save", label: "Save" },
              { value: "export", label: "Export" },
            ],
          },
          {
            value: "edit",
            trigger: "Edit",
            items: [{ value: "undo", label: "Undo" }],
          },
        ],
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});
