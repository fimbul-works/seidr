import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { $div, $span } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { isLinkActive, Link } from "./link.js";
import { Router } from "./router.js";

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock("../hooks/use-navigate.js", () => ({
  useNavigate: () => navigateMock,
}));

describeDualMode("Link Component", ({ getDocument, isSSR }) => {
  let container: HTMLDivElement;
  let document: Document;
  let unmount: () => void;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    navigateMock.mockClear();
  });

  afterEach(() => {
    unmount?.();
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("should render an anchor tag with correct href", () => {
    const App = createComponent(() => Link({ to: "/users" }, [$span({ textContent: "Users" })]), "App");

    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe("Users");
    expect(anchor?.getAttribute("href")).toBe("/users");
  });

  if (!isSSR) {
    it("should call navigate on click", () => {
      const App = createComponent(() => Link({ to: "/profile" }, [$span({ textContent: "Profile" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");

      // Simulate click
      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));

      expect(navigateMock).toHaveBeenCalledWith("/profile");
    });

    it("should handle reactive 'to' prop", () => {
      const path = createValue("/initial");
      const App = createComponent(() => Link({ to: path }, [$span({ textContent: "Dynamic" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");

      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
      expect(navigateMock).toHaveBeenCalledWith("/initial");

      path("/updated");

      // Check if navigate uses updated value
      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
      expect(navigateMock).toHaveBeenCalledWith("/updated");
    });
  }

  describe("activeClass & inactiveClass", () => {
    it("should apply activeClass when route matches current URL", () => {
      initRouter("/profile");
      const App = createComponent(
        () =>
          Link(
            {
              to: "/profile",
              className: "nav-link",
              activeClass: "active",
              inactiveClass: "inactive",
            },
            [$span({ textContent: "Profile" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.className).toBe("nav-link active");
    });

    it("should apply inactiveClass when route does not match current URL", () => {
      initRouter("/about");
      const App = createComponent(
        () =>
          Link(
            {
              to: "/profile",
              className: "nav-link",
              activeClass: "active",
              inactiveClass: "inactive",
            },
            [$span({ textContent: "Profile" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.className).toBe("nav-link inactive");
    });

    it("should format class cleanly when base className is omitted", () => {
      initRouter("/profile");
      const App = createComponent(
        () =>
          Link(
            {
              to: "/profile",
              activeClass: "active",
            },
            [$span({ textContent: "Profile" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.className).toBe("active");
    });

    it("should omit class attribute when inactive and no inactiveClass or className", () => {
      initRouter("/other");
      const App = createComponent(
        () =>
          Link(
            {
              to: "/profile",
              activeClass: "active",
            },
            [$span({ textContent: "Profile" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.className).toBe("");
    });

    it("should reactively toggle activeClass and inactiveClass when URL changes", () => {
      initRouter("/home");
      const url = getRouterState().url;

      const App = createComponent(
        () =>
          Link(
            {
              to: "/profile",
              className: "tab",
              activeClass: "tab-active",
              inactiveClass: "tab-inactive",
            },
            [$span({ textContent: "Profile" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a")!;
      expect(anchor.className).toBe("tab tab-inactive");

      // Navigate to profile
      url(new URL("http://localhost/profile"));
      expect(anchor.className).toBe("tab tab-active");

      // Navigate away
      url(new URL("http://localhost/settings"));
      expect(anchor.className).toBe("tab tab-inactive");
    });

    it("should reactively update when reactive 'to' prop changes", () => {
      initRouter("/user/1");
      const targetPath = createValue("/user/1", { hydrate: false });

      const App = createComponent(
        () =>
          Link(
            {
              to: targetPath,
              activeClass: "active",
              inactiveClass: "inactive",
            },
            [$span({ textContent: "User" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a")!;
      expect(anchor.className).toBe("active");

      // Change target path to different user
      targetPath("/user/2");
      expect(anchor.className).toBe("inactive");
    });

    it("should reactively update when activeClass or inactiveClass is a Value", () => {
      initRouter("/dashboard");
      const activeCls = createValue("is-selected", { hydrate: false });
      const inactiveCls = createValue("is-dimmed", { hydrate: false });

      const App = createComponent(
        () =>
          Link(
            {
              to: "/dashboard",
              activeClass: activeCls,
              inactiveClass: inactiveCls,
            },
            [$span({ textContent: "Dashboard" })],
          ),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a")!;
      expect(anchor.className).toBe("is-selected");

      activeCls("highlighted");
      expect(anchor.className).toBe("highlighted");

      getRouterState().url(new URL("http://localhost/other"));
      expect(anchor.className).toBe("is-dimmed");

      inactiveCls("faded");
      expect(anchor.className).toBe("faded");
    });

    it("should handle GET query parameters matching", () => {
      initRouter("/items?filter=active");
      const url = getRouterState().url;

      const App = createComponent(
        () =>
          $div({}, [
            Link({ to: "/items?filter=active", activeClass: "active", inactiveClass: "inactive" }, "Active"),
            Link({ to: "/items?filter=completed", activeClass: "active", inactiveClass: "inactive" }, "Completed"),
            // Default link without query parameters matches the path
            Link({ to: "/items", activeClass: "active" }, "All"),
            // Exact link without query parameters requires exact query match (no search params)
            Link({ to: "/items", exact: true, activeClass: "active", inactiveClass: "inactive" }, "Strict All"),
          ]),
        "App",
      );

      unmount = mount(App, container);
      const links = container.querySelectorAll("a");
      expect(links[0].className).toBe("active"); // ?filter=active matches
      expect(links[1].className).toBe("inactive"); // ?filter=completed does not match
      expect(links[2].className).toBe("active"); // /items matches path by default
      expect(links[3].className).toBe("inactive"); // exact: true fails because URL has ?filter=active

      // Switch to completed
      url(new URL("http://localhost/items?filter=completed"));
      expect(links[0].className).toBe("inactive");
      expect(links[1].className).toBe("active");
      expect(links[2].className).toBe("active");
      expect(links[3].className).toBe("inactive");

      // Switch to plain /items without query parameters
      url(new URL("http://localhost/items"));
      expect(links[0].className).toBe("inactive");
      expect(links[1].className).toBe("inactive");
      expect(links[2].className).toBe("active");
      expect(links[3].className).toBe("active"); // now strict matches!
    });

    it("should handle route parameters dynamically", () => {
      initRouter("/users/42");
      const url = getRouterState().url;

      const App = createComponent(
        () =>
          $div({}, [
            Link({ to: "/users/42", activeClass: "active", inactiveClass: "inactive" }, "User 42"),
            Link({ to: "/users/99", activeClass: "active", inactiveClass: "inactive" }, "User 99"),
            Link({ to: "/users/:id", activeClass: "active", inactiveClass: "inactive" }, "Any User"),
          ]),
        "App",
      );

      unmount = mount(App, container);
      const links = container.querySelectorAll("a");
      expect(links[0].className).toBe("active");
      expect(links[1].className).toBe("inactive");
      expect(links[2].className).toBe("active"); // Matches pattern /users/:id

      // Navigate to user 99
      url(new URL("http://localhost/users/99"));
      expect(links[0].className).toBe("inactive");
      expect(links[1].className).toBe("active");
      expect(links[2].className).toBe("active"); // Still matches pattern /users/:id
    });

    it("should support prefix matching when exact: false", () => {
      initRouter("/admin/users/settings");
      const App = createComponent(
        () =>
          $div({}, [
            Link({ to: "/admin", exact: false, activeClass: "active", inactiveClass: "inactive" }, "Admin Area"),
            Link({ to: "/admin", exact: true, activeClass: "active", inactiveClass: "inactive" }, "Admin Root"),
          ]),
        "App",
      );

      unmount = mount(App, container);
      const links = container.querySelectorAll("a");
      expect(links[0].className).toBe("active"); // Prefix matches
      expect(links[1].className).toBe("inactive"); // Exact does not match
    });

    it("should match local and full paths within nested routes", () => {
      initRouter("/app/dashboard");

      // Simulated nested router node with localPathname = "/dashboard"
      const UserSettings = createComponent(
        () =>
          $div({}, [
            Link({ to: "/dashboard", activeClass: "active" }, "Local Dashboard"),
            Link({ to: "/app/dashboard", activeClass: "active" }, "Full Dashboard"),
            Link({ to: "dashboard", activeClass: "active" }, "Relative Dashboard"),
            Link({ to: "/profile", activeClass: "active", inactiveClass: "inactive" }, "Local Profile"),
          ]),
        "UserSettings",
      );

      const NestedRouterComp = createComponent(
        () => Router([{ path: "/dashboard", component: UserSettings }]),
        "NestedRouterComp",
      );

      const RootComp = createComponent(() => Router([{ path: "/app/*", component: NestedRouterComp }]), "RootComp");

      unmount = mount(RootComp, container);
      const links = container.querySelectorAll("a");

      expect(links[0].className).toBe("active"); // Local path matches
      expect(links[1].className).toBe("active"); // Full path matches
      expect(links[2].className).toBe("active"); // Relative path matches
      expect(links[3].className).toBe("inactive"); // Other local path is inactive
    });
  });

  describe("isLinkActive utility", () => {
    it("should match simple pathname exactly", () => {
      const url = new URL("http://localhost/about");
      expect(isLinkActive("/about", url)).toBe(true);
      expect(isLinkActive("/contact", url)).toBe(false);
      expect(isLinkActive("/", url)).toBe(false);
    });

    it("should match root path '/' only on root", () => {
      expect(isLinkActive("/", new URL("http://localhost/"))).toBe(true);
      expect(isLinkActive("/", new URL("http://localhost/about"))).toBe(false);
    });

    it("should match query parameters regardless of parameter ordering", () => {
      const url = new URL("http://localhost/search?b=2&a=1");
      expect(isLinkActive("/search?a=1&b=2", url)).toBe(true);
      expect(isLinkActive("/search?a=1&b=3", url)).toBe(false);
    });

    it("should match query parameter subsets when not exact", () => {
      const url = new URL("http://localhost/search?q=foo&page=2");
      expect(isLinkActive("/search?q=foo", url)).toBe(true);
      expect(isLinkActive("/search?q=foo", url, undefined, undefined, true)).toBe(false);
    });

    it("should match route parameters with patterns and values", () => {
      const url = new URL("http://localhost/posts/react-guide");
      expect(isLinkActive("/posts/react-guide", url)).toBe(true);
      expect(isLinkActive("/posts/:slug", url)).toBe(true);
      expect(isLinkActive("/posts/vue-guide", url)).toBe(false);
    });

    it("should match wildcards", () => {
      const url = new URL("http://localhost/docs/api/endpoints/users");
      expect(isLinkActive("/docs/*", url)).toBe(true);
    });

    it("should match URL hashes when specified in 'to'", () => {
      const url = new URL("http://localhost/docs#section-1");
      expect(isLinkActive("/docs#section-1", url)).toBe(true);
      expect(isLinkActive("/docs#section-2", url)).toBe(false);
      // Link without hash matches regardless of current hash
      expect(isLinkActive("/docs", url)).toBe(true);
    });
  });
});
