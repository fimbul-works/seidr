import {
  createComponent,
  createValue,
  getCurrentUrl,
  mount,
  registerNavigationHandler,
  setCurrentUrl,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Link } from "./link.js";

describeDualMode("Link", ({ getDocument, isSSR }) => {
  let container: HTMLDivElement;
  let document: Document;
  let unmount: () => void;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    setCurrentUrl("http://localhost/");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    unmount?.();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("renders an anchor tag with data-component and correct href by default", () => {
    const App = createComponent(() => Link({ href: "/docs" }, "Documentation"));
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe("Documentation");
    expect(anchor?.getAttribute("href")).toBe("/docs");
    expect(anchor?.getAttribute("data-component")).toBe("link");
  });

  it("supports polymorphic element rendering (as='span')", () => {
    const App = createComponent(() => Link({ as: "span", href: "/docs" }, "Span Link"));
    unmount = mount(App, container);

    const span = container.querySelector("span");
    expect(span).toBeTruthy();
    expect(span?.getAttribute("data-component")).toBe("link");
    expect(span?.getAttribute("role")).toBe("link");
    expect(String(span?.getAttribute("tabindex"))).toBe("0");
  });

  it("applies active attributes when current URL matches href", () => {
    setCurrentUrl("http://localhost/docs");

    const App = createComponent(() =>
      Link(
        {
          href: "/docs",
          className: "base-link",
          activeClass: "is-active",
          inactiveClass: "is-inactive",
        },
        "Docs",
      ),
    );
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("data-current")).toBe("");
    expect(anchor?.getAttribute("aria-current")).toBe("page");
    expect(anchor?.getAttribute("class")).toContain("is-active");
    expect(anchor?.getAttribute("class")).not.toContain("is-inactive");
  });

  it("applies inactive attributes when current URL does not match", () => {
    setCurrentUrl("http://localhost/about");

    const App = createComponent(() =>
      Link(
        {
          href: "/docs",
          className: "base-link",
          activeClass: "is-active",
          inactiveClass: "is-inactive",
        },
        "Docs",
      ),
    );
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor?.hasAttribute("data-current")).toBe(false);
    expect(anchor?.hasAttribute("aria-current")).toBe(false);
    expect(anchor?.getAttribute("class")).toContain("is-inactive");
    expect(anchor?.getAttribute("class")).not.toContain("is-active");
  });

  it("supports custom ariaCurrent prop values", () => {
    setCurrentUrl("http://localhost/checkout/step-2");

    const App = createComponent(() =>
      Link(
        {
          href: "/checkout/step-2",
          ariaCurrent: "step",
        },
        "Step 2",
      ),
    );
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("aria-current")).toBe("step");
  });

  it("respects exact matching prop", () => {
    setCurrentUrl("http://localhost/docs/getting-started");

    const App = createComponent(() => [
      Link({ href: "/docs", exact: false, className: "prefix-link" }, "Prefix"),
      Link({ href: "/docs", exact: true, className: "exact-link" }, "Exact"),
    ]);
    unmount = mount(App, container);

    const prefixLink = container.querySelector(".prefix-link");
    const exactLink = container.querySelector(".exact-link");

    expect(prefixLink?.hasAttribute("data-current")).toBe(true);
    expect(exactLink?.hasAttribute("data-current")).toBe(false);
  });

  it("handles disabled state correctly (removes href, sets aria-disabled)", () => {
    const App = createComponent(() =>
      Link(
        {
          href: "/settings",
          disabled: true,
        },
        "Settings",
      ),
    );
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor?.hasAttribute("href")).toBe(false);
    expect(anchor?.getAttribute("aria-disabled")).toBe("true");
    expect(anchor?.getAttribute("data-disabled")).toBe("");
    expect(anchor?.getAttribute("role")).toBe("link");
  });

  it("handles dynamic reactive disabled changes", () => {
    const disabled = createValue(false);
    const App = createComponent(() =>
      Link(
        {
          href: "/settings",
          disabled,
        },
        "Settings",
      ),
    );
    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("/settings");
    expect(anchor?.hasAttribute("data-disabled")).toBe(false);

    disabled(true);

    expect(anchor?.hasAttribute("href")).toBe(false);
    expect(anchor?.getAttribute("data-disabled")).toBe("");
    expect(anchor?.getAttribute("aria-disabled")).toBe("true");
  });

  if (!isSSR) {
    it("intercepts click and dispatches to navigation handler", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const App = createComponent(() => Link({ href: "/profile" }, "Profile"));
      unmount = mount(App, container);

      const anchor = container.querySelector("a")!;
      anchor.click();

      expect(handler).toHaveBeenCalledWith("/profile", undefined);
      unregister();
    });

    it("triggers click on Enter key for custom polymorphic elements", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const App = createComponent(() => Link({ as: "span", href: "/profile" }, "Profile"));
      unmount = mount(App, container);

      const span = container.querySelector("span")!;
      span.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

      expect(handler).toHaveBeenCalledWith("/profile", undefined);
      unregister();
    });

    it("does not navigate when disabled link is clicked", () => {
      const handler = vi.fn().mockReturnValue(true);
      const unregister = registerNavigationHandler(handler);

      const App = createComponent(() => Link({ href: "/profile", disabled: true }, "Profile"));
      unmount = mount(App, container);

      const anchor = container.querySelector("a")!;
      anchor.click();

      expect(handler).not.toHaveBeenCalled();
      unregister();
    });
  }
});
