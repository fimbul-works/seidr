import { createComponent, createValue, mount, registerNavigationHandler, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { type BreadcrumbItemDescriptor, Breadcrumbs, createBreadcrumbs } from "./index.js";

describeDualMode("Breadcrumbs", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it("should have default aria-label and semantic data attributes", () => {
    const root = setup(() => {
      const breadcrumbs = createBreadcrumbs();
      return breadcrumbs.Root([
        breadcrumbs.List([
          breadcrumbs.Item([breadcrumbs.Link({ href: "/" }, "Home"), breadcrumbs.Separator()]),
          breadcrumbs.Item([breadcrumbs.Link({ current: true }, "Components")]),
        ]),
      ]);
    });

    const nav = root.querySelector("nav") as HTMLElement;
    const ol = root.querySelector("ol") as HTMLElement;
    const items = root.querySelectorAll("li");
    const links = root.querySelectorAll("a");
    const separator = root.querySelector("span") as HTMLElement;

    expect(nav).not.toBeNull();
    expect(nav.getAttribute("aria-label")).toBe("Breadcrumbs");
    expect(nav.getAttribute("data-component")).toBe("Breadcrumbs");

    expect(ol.getAttribute("data-component")).toBe("Breadcrumbs");
    expect(ol.getAttribute("data-part")).toBe("List");

    expect(items[0]?.getAttribute("data-component")).toBe("Breadcrumbs");
    expect(items[0]?.getAttribute("data-part")).toBe("Item");

    expect(links[0]?.getAttribute("data-component")).toBe("Breadcrumbs");
    expect(links[0]?.getAttribute("data-part")).toBe("Link");

    expect(separator.getAttribute("data-component")).toBe("Breadcrumbs");
    expect(separator.getAttribute("data-part")).toBe("Separator");
    expect(separator.getAttribute("aria-hidden")).toBe("true");
    expect(separator.textContent).toBe("/");
  });

  it("supports custom aria-label", () => {
    const root = setup(() => {
      const breadcrumbs = createBreadcrumbs({ ariaLabel: "Wegweiser" });
      return breadcrumbs.Root();
    });

    const nav = root.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe("Wegweiser");
  });

  it("supports custom string and element separator", () => {
    const root = setup(() => {
      const breadcrumbs = createBreadcrumbs({ separator: ">" });
      return breadcrumbs.Root([
        breadcrumbs.List([
          breadcrumbs.Item([breadcrumbs.Link({ href: "/" }, "Home"), breadcrumbs.Separator()]),
          breadcrumbs.Item([breadcrumbs.Link({ current: true }, "Components")]),
        ]),
      ]);
    });

    const separator = root.querySelector("[data-part='Separator']");
    expect(separator?.textContent).toBe(">");
  });

  describe("Link", () => {
    it("should have aria-current='page' and data-current when current is true", () => {
      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ href: "/" }, "Home"), breadcrumbs.Separator()]),
            breadcrumbs.Item([breadcrumbs.Link({ href: "/components", current: true }, "Components")]),
          ]),
        ]);
      });

      const links = root.querySelectorAll("a");
      const currentLink = links[1];

      expect(currentLink?.getAttribute("aria-current")).toBe("page");
      expect(currentLink?.hasAttribute("data-current")).toBe(true);
      expect(currentLink?.getAttribute("aria-disabled")).toBe("true");
      expect(currentLink?.hasAttribute("data-disabled")).toBe(true);
      expect(currentLink?.hasAttribute("href")).toBe(false);
      expect(currentLink?.getAttribute("role")).toBe("link");
      expect(currentLink?.hasAttribute("disabled")).toBe(false);
    });

    it("should be disabled and omit href when disabled is true", () => {
      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([breadcrumbs.Item([breadcrumbs.Link({ href: "/docs", disabled: true }, "Docs")])]),
        ]);
      });

      const link = root.querySelector("a");
      expect(link?.getAttribute("aria-disabled")).toBe("true");
      expect(link?.hasAttribute("data-disabled")).toBe(true);
      expect(link?.hasAttribute("href")).toBe(false);
      expect(link?.getAttribute("role")).toBe("link");
      expect(link?.hasAttribute("disabled")).toBe(false);
    });

    it("should support custom element with role='link' and tabIndex", () => {
      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ as: "span", href: "/home" }, "Home")]),
            breadcrumbs.Item([breadcrumbs.Link({ as: "span", href: "/about", current: true }, "About")]),
          ]),
        ]);
      });

      const spans = root.querySelectorAll("[data-part='Link']");
      const activeSpan = spans[0];
      const currentSpan = spans[1];

      expect(activeSpan?.getAttribute("role")).toBe("link");
      expect(String(activeSpan?.getAttribute("tabindex"))).toBe("0");
      expect(activeSpan?.hasAttribute("href")).toBe(false);

      expect(currentSpan?.getAttribute("role")).toBe("link");
      expect(currentSpan?.hasAttribute("tabindex")).toBe(false);
      expect(currentSpan?.hasAttribute("href")).toBe(false);
    });

    it("updates href, current, and disabled states reactively", () => {
      const href = createValue<string | URL>("/initial");
      const current = createValue(false);
      const disabled = createValue(false);

      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([breadcrumbs.Item([breadcrumbs.Link({ href, current, disabled }, "Dynamic")])]),
        ]);
      });

      const link = root.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/initial");
      expect(link?.hasAttribute("role")).toBe(false);
      expect(link?.hasAttribute("aria-current")).toBe(false);
      expect(link?.hasAttribute("aria-disabled")).toBe(false);

      href("/updated");
      expect(link?.getAttribute("href")).toBe("/updated");

      disabled(true);
      expect(link?.hasAttribute("href")).toBe(false);
      expect(link?.getAttribute("role")).toBe("link");
      expect(link?.getAttribute("aria-disabled")).toBe("true");
      expect(link?.hasAttribute("data-disabled")).toBe(true);

      disabled(false);
      expect(link?.getAttribute("href")).toBe("/updated");
      expect(link?.hasAttribute("aria-disabled")).toBe(false);

      current(true);
      expect(link?.hasAttribute("href")).toBe(false);
      expect(link?.getAttribute("role")).toBe("link");
      expect(link?.getAttribute("aria-current")).toBe("page");
      expect(link?.hasAttribute("data-current")).toBe(true);
      expect(link?.getAttribute("aria-disabled")).toBe("true");
      expect(link?.hasAttribute("data-disabled")).toBe(true);
    });

    it("supports URL instances as href", () => {
      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ href: new URL("http://localhost/docs?page=3") }, "Docs")]),
          ]),
        ]);
      });

      const link = root.querySelector("a");
      expect(link?.getAttribute("href")).toBe("http://localhost/docs?page=3");
    });

    it("navigates via core navigate() on click", () => {
      if (isSSR) return;

      const navigatedUrls: (string | number | URL)[] = [];
      const unregister = registerNavigationHandler((url) => {
        navigatedUrls.push(url);
        return true;
      });

      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ href: "/dashboard" }, "Dashboard")]),
            breadcrumbs.Item([breadcrumbs.Link({ href: "/current", current: true }, "Current")]),
          ]),
        ]);
      });

      const links = root.querySelectorAll("a");
      const link1 = links[0] as HTMLAnchorElement;
      const link2 = links[1] as HTMLAnchorElement;

      link1.click();
      expect(navigatedUrls).toEqual(["/dashboard"]);

      // Clicking current link does not trigger navigation
      link2.click();
      expect(navigatedUrls).toEqual(["/dashboard"]);

      unregister();
    });

    it("does not intercept external URLs or target=_blank and supports URL navigation without double-calling", () => {
      if (isSSR) return;

      const handler = vi.fn().mockReturnValue(false);
      const unregister = registerNavigationHandler(handler);

      const baseOrigin = window.location.origin !== "null" ? window.location.origin : "http://localhost";
      const sameOriginUrl = new URL("/catalog/items?sort=asc", baseOrigin);

      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ href: "https://example.com/external" }, "External")]),
            breadcrumbs.Item([breadcrumbs.Link({ href: "/blank", target: "_blank" }, "Blank")]),
            breadcrumbs.Item([breadcrumbs.Link({ href: sameOriginUrl }, "SameOrigin")]),
          ]),
        ]);
      });

      const links = root.querySelectorAll("a");
      for (const l of links) {
        l.addEventListener("click", (e) => e.preventDefault());
      }

      (links[0] as HTMLAnchorElement).click();
      (links[1] as HTMLAnchorElement).click();
      expect(handler).not.toHaveBeenCalled();

      (links[2] as HTMLAnchorElement).click();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith("/catalog/items?sort=asc", undefined);

      unregister();
    });

    it("handles Enter activation on custom elements and respects disabled, current, and user onkeydown", () => {
      if (isSSR) return;

      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);
      const userKeydown = vi.fn((e: KeyboardEvent) => e.preventDefault());

      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ as: "span", href: "/active" }, "Active")]),
            breadcrumbs.Item([breadcrumbs.Link({ as: "span", href: "/disabled", disabled: true }, "Disabled")]),
            breadcrumbs.Item([breadcrumbs.Link({ as: "span", href: "/current", current: true }, "Current")]),
            breadcrumbs.Item([
              breadcrumbs.Link({ as: "span", href: "/cancelled", onkeydown: userKeydown }, "Cancelled"),
            ]),
          ]),
        ]);
      });

      const spans = root.querySelectorAll("[data-part='Link']");
      spans[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith("/active", undefined);

      handler.mockClear();
      spans[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      spans[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(handler).not.toHaveBeenCalled();

      spans[3]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      expect(userKeydown).toHaveBeenCalledTimes(1);
      expect(handler).not.toHaveBeenCalled();

      unregister();
    });
  });

  describe("Tier 1: All-in-One Breadcrumbs component", () => {
    it("renders declarative items with automatic separators", () => {
      const root = setup(() =>
        Breadcrumbs({
          className: "my-breadcrumbs",
          separator: "/",
          items: [
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { label: "Laptops" }, // last item defaults to current
          ],
        }),
      );

      const nav = root.querySelector(".my-breadcrumbs");
      expect(nav).not.toBeNull();

      const items = root.querySelectorAll("li");
      expect(items.length).toBe(3);

      const separators = root.querySelectorAll("[data-part='Separator']");
      // Separator after item 0 and item 1, but NONE after item 2
      expect(separators.length).toBe(2);

      const links = root.querySelectorAll("[data-part='Link']");
      expect(links.length).toBe(3);
      expect(links[0]?.textContent).toBe("Home");
      expect(links[1]?.textContent).toBe("Products");
      expect(links[2]?.textContent).toBe("Laptops");
      expect(links[2]?.getAttribute("aria-current")).toBe("page");
    });

    it("supports reactive Value<BreadcrumbItemDescriptor[]>", () => {
      const itemsVal = createValue<BreadcrumbItemDescriptor[]>([
        { href: "/", label: "Home" },
        { href: "/blog", label: "Blog" },
      ]);

      const root = setup(() =>
        Breadcrumbs({
          items: itemsVal,
        }),
      );

      let items = root.querySelectorAll("li");
      expect(items.length).toBe(2);
      expect(root.querySelectorAll("[data-part='Separator']").length).toBe(1);

      // Mutate reactive value dynamically
      itemsVal((prev) => [...prev, { href: "/blog/post-1", label: "Post 1" }]);

      items = root.querySelectorAll("li");
      expect(items.length).toBe(3);
      expect(root.querySelectorAll("[data-part='Separator']").length).toBe(2);
    });
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Breadcrumbs({
        items: [
          { href: "/", label: "Home" },
          { href: "/settings", label: "Settings" },
          { label: "Profile", current: true },
        ],
      }),
    );

    // @ts-expect-error vitest-axe types
    expect(await axe(root)).toHaveNoViolations();
  });
});
