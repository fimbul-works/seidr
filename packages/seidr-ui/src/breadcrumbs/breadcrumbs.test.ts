import { createComponent, createValue, mount, registerNavigationHandler, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Breadcrumbs, createBreadcrumbs } from "./index.js";

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
    expect(nav.getAttribute("data-component")).toBe("breadcrumbs");

    expect(ol.getAttribute("data-component")).toBe("breadcrumbs");
    expect(ol.getAttribute("data-part")).toBe("list");

    expect(items[0]?.getAttribute("data-component")).toBe("breadcrumbs");
    expect(items[0]?.getAttribute("data-part")).toBe("item");

    expect(links[0]?.getAttribute("data-component")).toBe("breadcrumbs");
    expect(links[0]?.getAttribute("data-part")).toBe("link");

    expect(separator.getAttribute("data-component")).toBe("breadcrumbs");
    expect(separator.getAttribute("data-part")).toBe("separator");
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

    const separator = root.querySelector("[data-part='separator']");
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
    });

    it("should be disabled and omit href when disabled is true", () => {
      const root = setup(() => {
        const breadcrumbs = createBreadcrumbs();
        return breadcrumbs.Root([
          breadcrumbs.List([
            breadcrumbs.Item([breadcrumbs.Link({ href: "/docs", disabled: true }, "Docs")]),
          ]),
        ]);
      });

      const link = root.querySelector("a");
      expect(link?.getAttribute("aria-disabled")).toBe("true");
      expect(link?.hasAttribute("data-disabled")).toBe(true);
      expect(link?.hasAttribute("href")).toBe(false);
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

      const spans = root.querySelectorAll("[data-part='link']");
      const activeSpan = spans[0];
      const currentSpan = spans[1];

      expect(activeSpan?.getAttribute("role")).toBe("link");
      expect(String(activeSpan?.getAttribute("tabindex"))).toBe("0");

      expect(currentSpan?.getAttribute("role")).toBe("link");
      expect(currentSpan?.hasAttribute("tabindex")).toBe(false);
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

      const separators = root.querySelectorAll("[data-part='separator']");
      // Separator after item 0 and item 1, but NONE after item 2
      expect(separators.length).toBe(2);

      const links = root.querySelectorAll("[data-part='link']");
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
      expect(root.querySelectorAll("[data-part='separator']").length).toBe(1);

      // Mutate reactive value dynamically
      itemsVal((prev) => [...prev, { href: "/blog/post-1", label: "Post 1" }]);

      items = root.querySelectorAll("li");
      expect(items.length).toBe(3);
      expect(root.querySelectorAll("[data-part='separator']").length).toBe(2);
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

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
