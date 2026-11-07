import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import {
  createNavigationMenu,
  NavigationMenu,
  type NavigationMenuItemDescriptor,
} from "./index.js";

describeDualMode("NavigationMenu", ({ getDocument, isSSR }) => {
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
      NavigationMenu({
        id: "test-nav",
        items: [
          {
            value: "products",
            trigger: "Products",
            items: [
              { value: "analytics", label: "Analytics" },
              { value: "commerce", label: "Commerce" },
            ],
          },
          {
            href: "https://example.com/docs",
            trigger: "Docs",
          },
        ],
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.tagName.toLowerCase()).toBe("nav");
    expect(rootEl.getAttribute("data-component")).toBe("navigation-menu");

    const listEl = root.querySelector("[data-part='list']") as HTMLElement;
    expect(listEl).not.toBeNull();
    expect(listEl.tagName.toLowerCase()).toBe("ul");
    expect(listEl.getAttribute("role")).toBe("menubar");
    expect(listEl.getAttribute("aria-orientation")).toBe("horizontal");

    const menus = root.querySelectorAll("[data-part='menu']");
    expect(menus.length).toBe(2);
    expect(menus[0].getAttribute("role")).toBe("none");

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute("role")).toBe("menuitem");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toBe("Products");
    expect(String(trigger.getAttribute("tabindex"))).toBe("0");

    const link = root.querySelector("[data-part='link']") as HTMLElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute("role")).toBe("menuitem");
    expect(link.getAttribute("href")).toBe("https://example.com/docs");
    expect(link.textContent).toBe("Docs");
    expect(String(link.getAttribute("tabindex"))).toBe("-1");

    if (!isSSR) {
      expect(root.querySelector("[data-part='content']")).toBeNull();
    }
  });

  it("supports fine-grained composition via createNavigationMenu (Tier 2)", () => {
    let navInstance!: ReturnType<typeof createNavigationMenu>;

    const root = setup(() => {
      navInstance = createNavigationMenu({ id: "custom-nav" });
      const productsMenu = navInstance.createMenu("products");

      return navInstance.Root({}, [
        navInstance.List({}, [
          navInstance.Menu({ value: "products" }, [
            productsMenu.Trigger({}, "Explore Products"),
            productsMenu.Content({}, [
              productsMenu.Item({ value: "saas" }, "SaaS Platform"),
              productsMenu.Item({ value: "api" }, "Developer API"),
            ]),
          ]),
          navInstance.Menu({ value: "pricing" }, [
            navInstance.Link({ href: "/pricing" }, "Pricing"),
          ]),
        ]),
        navInstance.Viewport(),
      ]);
    });

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toBe("Explore Products");

    const viewport = root.querySelector("[data-part='viewport']") as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute("data-component")).toBe("navigation-menu");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("opens menu after hover delay and closes after leave delay", () => {
        vi.useFakeTimers();
        try {
          let navInstance!: ReturnType<typeof createNavigationMenu>;

          const root = setup(() => {
            navInstance = createNavigationMenu({
              id: "hover-nav",
              delayDuration: 150,
              skipDelayDuration: 250,
            });
            const menu1 = navInstance.createMenu("menu1");

            return navInstance.Root({}, [
              navInstance.List({}, [
                navInstance.Menu({ value: "menu1" }, [
                  menu1.Trigger({}, "Menu 1"),
                  menu1.Content({}, [menu1.Item({ value: "item1" }, "Item 1")]),
                ]),
              ]),
            ]);
          });

          const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
          expect(root.querySelector("[data-part='content']")).toBeNull();

          // 1. Pointer enters trigger -> starts hover timer
          trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
          expect(navInstance.isOpen()).toBe(false);

          // Advance 100ms: still closed
          vi.advanceTimersByTime(100);
          expect(navInstance.isOpen()).toBe(false);

          // Advance remaining 50ms: opens!
          vi.advanceTimersByTime(50);
          expect(navInstance.isOpen()).toBe(true);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();

          // 2. Pointer leaves trigger -> starts leave timer (250ms)
          trigger.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
          expect(navInstance.isOpen()).toBe(true);

          // Advance 200ms: still open
          vi.advanceTimersByTime(200);
          expect(navInstance.isOpen()).toBe(true);

          // Advance remaining 50ms: closes!
          vi.advanceTimersByTime(50);
          expect(navInstance.isOpen()).toBe(false);
        } finally {
          vi.useRealTimers();
        }
      });

      it("grace period: switches immediately without delay when already open", () => {
        vi.useFakeTimers();
        try {
          let navInstance!: ReturnType<typeof createNavigationMenu>;

          const root = setup(() => {
            navInstance = createNavigationMenu({
              id: "grace-nav",
              delayDuration: 200,
            });
            const menu1 = navInstance.createMenu("menu1");
            const menu2 = navInstance.createMenu("menu2");

            return navInstance.Root({}, [
              navInstance.List({}, [
                navInstance.Menu({ value: "menu1" }, [
                  menu1.Trigger({}, "Menu 1"),
                  menu1.Content({}, [menu1.Item({ value: "m1-i" }, "Item 1")]),
                ]),
                navInstance.Menu({ value: "menu2" }, [
                  menu2.Trigger({}, "Menu 2"),
                  menu2.Content({}, [menu2.Item({ value: "m2-i" }, "Item 2")]),
                ]),
              ]),
            ]);
          });

          const triggers = root.querySelectorAll("[data-part='trigger']");
          const trigger1 = triggers[0] as HTMLElement;
          const trigger2 = triggers[1] as HTMLElement;

          // Hover menu 1 and open it
          trigger1.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
          vi.advanceTimersByTime(200);
          expect(navInstance.value()).toBe("menu1");

          // Hover menu 2 while menu 1 is open -> instant switch (0ms delay)!
          trigger2.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
          expect(navInstance.value()).toBe("menu2");
        } finally {
          vi.useRealTimers();
        }
      });

      it("cancels leave timer when pointer enters Content", () => {
        vi.useFakeTimers();
        try {
          let navInstance!: ReturnType<typeof createNavigationMenu>;

          const root = setup(() => {
            navInstance = createNavigationMenu({
              id: "content-grace-nav",
              delayDuration: 100,
              skipDelayDuration: 200,
            });
            const menu1 = navInstance.createMenu("menu1");

            return navInstance.Root({}, [
              navInstance.List({}, [
                navInstance.Menu({ value: "menu1" }, [
                  menu1.Trigger({}, "Menu 1"),
                  menu1.Content({}, [menu1.Item({ value: "item1" }, "Item 1")]),
                ]),
              ]),
            ]);
          });

          const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
          trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
          vi.advanceTimersByTime(100);
          expect(navInstance.isOpen()).toBe(true);

          // Leave trigger -> starts 200ms timer
          trigger.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
          vi.advanceTimersByTime(100);

          // Enter Content -> cancels leave timer!
          const content = root.querySelector("[data-part='content']") as HTMLElement;
          content.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));

          // Advance 200ms: still open because timer was cancelled!
          vi.advanceTimersByTime(200);
          expect(navInstance.isOpen()).toBe(true);

          // Leave Content -> starts 200ms timer
          content.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
          vi.advanceTimersByTime(200);
          expect(navInstance.isOpen()).toBe(false);
        } finally {
          vi.useRealTimers();
        }
      });

      it("toggles open/close on trigger click", () => {
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({ id: "click-nav" });
          const menu = navInstance.createMenu("m");

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "m" }, [
                menu.Trigger({}, "Click Menu"),
                menu.Content({}, [menu.Item({ value: "item" }, "Item")]),
              ]),
            ]),
          ]);
        });

        const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
        expect(navInstance.isOpen()).toBe(false);

        trigger.click();
        expect(navInstance.isOpen()).toBe(true);

        trigger.click();
        expect(navInstance.isOpen()).toBe(false);
      });

      it("supports roving tabindex and keyboard navigation across triggers and links", () => {
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({ id: "keyboard-nav" });
          const menu1 = navInstance.createMenu("m1");
          const menu2 = navInstance.createMenu("m2");

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "m1" }, [
                menu1.Trigger({}, "Trigger 1"),
                menu1.Content({}, [menu1.Item({ value: "i1" }, "Item 1")]),
              ]),
              navInstance.Menu({ value: "link" }, [
                navInstance.Link({ value: "link", href: "/docs" }, "Direct Link"),
              ]),
              navInstance.Menu({ value: "m2" }, [
                menu2.Trigger({}, "Trigger 2"),
                menu2.Content({}, [menu2.Item({ value: "i2" }, "Item 2")]),
              ]),
            ]),
          ]);
        });

        const list = root.querySelector("[data-part='list']") as HTMLElement;
        const trigger1 = root.querySelectorAll("[data-part='trigger']")[0] as HTMLElement;
        const link = root.querySelector("[data-part='link']") as HTMLElement;
        const trigger2 = root.querySelectorAll("[data-part='trigger']")[1] as HTMLElement;

        expect(String(trigger1.getAttribute("tabindex"))).toBe("0");
        expect(String(link.getAttribute("tabindex"))).toBe("-1");
        expect(String(trigger2.getAttribute("tabindex"))).toBe("-1");

        // ArrowRight: focus moves to Direct Link
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("link");
        expect(String(link.getAttribute("tabindex"))).toBe("0");
        expect(String(trigger1.getAttribute("tabindex"))).toBe("-1");

        // ArrowRight again: focus moves to Trigger 2
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("m2");

        // ArrowLeft: returns to Direct Link
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("link");

        // Home: goes to first item (Trigger 1)
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("m1");

        // End: goes to last item (Trigger 2)
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("m2");
      });

      it("closes open menu on Escape key", () => {
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({ id: "escape-nav" });
          const menu = navInstance.createMenu("esc-m");

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "esc-m" }, [
                menu.Trigger({}, "Esc Menu"),
                menu.Content({}, [menu.Item({ value: "item" }, "Item")]),
              ]),
            ]),
          ]);
        });

        const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
        trigger.click();
        expect(navInstance.isOpen()).toBe(true);

        const list = root.querySelector("[data-part='list']") as HTMLElement;
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(navInstance.isOpen()).toBe(false);
      });

      it("dismisses open menu on outside pointer interaction", async () => {
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({ id: "outside-nav" });
          const menu = navInstance.createMenu("out-m");

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "out-m" }, [
                menu.Trigger({}, "Outside Menu"),
                menu.Content({}, [menu.Item({ value: "item" }, "Item")]),
              ]),
            ]),
          ]);
        });

        const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
        trigger.click();
        expect(navInstance.isOpen()).toBe(true);

        // Outside interaction requires ticking beyond the internal listener registration delay
        await new Promise((resolve) => setTimeout(resolve, 20));

        const outsideEl = getDocument().createElement("button");
        getDocument().body.appendChild(outsideEl);

        outsideEl.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
        expect(navInstance.isOpen()).toBe(false);

        outsideEl.remove();
      });

      it("supports controlled state via value and onValueChange", () => {
        const controlledVal = createValue<string | null>("menuA");
        const changeSpy = vi.fn();

        setup(() => {
          const nav = createNavigationMenu({
            id: "controlled-nav",
            value: controlledVal,
            onValueChange: changeSpy,
          });
          const menuA = nav.createMenu("menuA");
          const menuB = nav.createMenu("menuB");

          return nav.Root({}, [
            nav.List({}, [
              nav.Menu({ value: "menuA" }, [
                menuA.Trigger({}, "Menu A"),
                menuA.Content({}, [menuA.Item({ value: "a1" }, "A1")]),
              ]),
              nav.Menu({ value: "menuB" }, [
                menuB.Trigger({}, "Menu B"),
                menuB.Content({}, [menuB.Item({ value: "b1" }, "B1")]),
              ]),
            ]),
          ]);
        });

        expect(controlledVal()).toBe("menuA");

        // Mutating controlled value opens Menu B
        controlledVal("menuB");
        expect(changeSpy).toHaveBeenCalledWith("menuB");

        // Mutating to null closes menu
        controlledVal(null);
        expect(changeSpy).toHaveBeenCalledWith(null);
      });

      it("supports CheckboxItem and RadioGroup inside navigation dropdowns", () => {
        const checkedVal = createValue<boolean>(false);
        const radioVal = createValue<string>("standard");
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({ id: "settings-nav" });
          const viewMenu = navInstance.createMenu("view");
          const radioGroup = viewMenu.createRadioGroup({
            value: radioVal,
            onChange: (v) => radioVal(v),
          });

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "view" }, [
                viewMenu.Trigger({}, "View Settings"),
                viewMenu.Content({}, [
                  viewMenu.CheckboxItem(
                    {
                      value: "dark",
                      checked: checkedVal,
                      onChange: (c) => checkedVal(c),
                    },
                    "Dark Mode",
                  ),
                  radioGroup.Root({}, [
                    radioGroup.Item({ value: "compact" }, "Compact"),
                    radioGroup.Item({ value: "standard" }, "Standard"),
                  ]),
                ]),
              ]),
            ]),
          ]);
        });

        const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
        trigger.click();
        expect(navInstance.isOpen()).toBe(true);

        const chk = root.querySelector("[data-part='checkbox-item']") as HTMLElement;
        expect(chk.getAttribute("aria-checked")).toBe("false");
        chk.click();
        expect(checkedVal()).toBe(true);

        const radios = root.querySelectorAll("[data-part='radio-item']");
        expect(radios[1].getAttribute("aria-checked")).toBe("true");
        (radios[0] as HTMLElement).click();
        expect(radioVal()).toBe("compact");
      });

      it("supports vertical orientation", () => {
        let navInstance!: ReturnType<typeof createNavigationMenu>;

        const root = setup(() => {
          navInstance = createNavigationMenu({
            id: "vert-nav",
            orientation: "vertical",
          });
          const m1 = navInstance.createMenu("m1");
          const m2 = navInstance.createMenu("m2");

          return navInstance.Root({}, [
            navInstance.List({}, [
              navInstance.Menu({ value: "m1" }, [
                m1.Trigger({}, "M1"),
                m1.Content({}, [m1.Item({ value: "i1" }, "I1")]),
              ]),
              navInstance.Menu({ value: "m2" }, [
                m2.Trigger({}, "M2"),
                m2.Content({}, [m2.Item({ value: "i2" }, "I2")]),
              ]),
            ]),
          ]);
        });

        const list = root.querySelector("[data-part='list']") as HTMLElement;
        expect(list.getAttribute("aria-orientation")).toBe("vertical");

        // ArrowDown navigates vertically to next menu
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("m2");

        // ArrowUp returns to previous menu
        list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
        expect(navInstance.activeTrigger()).toBe("m1");
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          NavigationMenu({
            id: "axe-nav",
            ariaLabel: "Site Navigation",
            items: [
              {
                value: "overview",
                trigger: "Overview",
                items: [
                  { value: "features", label: "Features" },
                  { value: "roadmap", label: "Roadmap" },
                ],
              },
              {
                value: "pricing",
                href: "/pricing",
                trigger: "Pricing",
              },
            ],
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
