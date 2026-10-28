import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import { $div, $span } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRouterState } from "../get-router-state.js";
import { initRouter } from "../init-router.js";
import { Link } from "./link.js";
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
    const App = createComponent(() => Link({ href: "/users" }, [$span({ textContent: "Users" })]), "App");

    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe("Users");
    expect(anchor?.getAttribute("href")).toBe("/users");
  });

  if (!isSSR) {
    it("should call navigate on click", () => {
      const App = createComponent(() => Link({ href: "/profile" }, [$span({ textContent: "Profile" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");

      // Simulate click
      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));

      expect(navigateMock).toHaveBeenCalledWith("/profile");
    });

    it("should handle reactive 'to' prop", () => {
      const path = createValue("/initial");
      const App = createComponent(() => Link({ href: path }, [$span({ textContent: "Dynamic" })]), "App");

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
              href: "/profile",
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
              href: "/profile",
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
              href: "/profile",
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
              href: "/profile",
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
              href: "/profile",
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
              href: targetPath,
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
      const activeCls = createValue<string | undefined>("is-selected", { hydrate: false });
      const inactiveCls = createValue<string | undefined>("is-dimmed", { hydrate: false });

      const App = createComponent(
        () =>
          Link(
            {
              href: "/dashboard",
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
            Link({ href: "/items?filter=active", activeClass: "active", inactiveClass: "inactive" }, "Active"),
            Link({ href: "/items?filter=completed", activeClass: "active", inactiveClass: "inactive" }, "Completed"),
            // Default link without query parameters matches the path
            Link({ href: "/items", activeClass: "active" }, "All"),
            // Exact link without query parameters requires exact query match (no search params)
            Link({ href: "/items", exact: true, activeClass: "active", inactiveClass: "inactive" }, "Strict All"),
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
            Link({ href: "/users/42", activeClass: "active", inactiveClass: "inactive" }, "User 42"),
            Link({ href: "/users/99", activeClass: "active", inactiveClass: "inactive" }, "User 99"),
            Link({ href: "/users/:id", activeClass: "active", inactiveClass: "inactive" }, "Any User"),
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
            Link({ href: "/admin", exact: false, activeClass: "active", inactiveClass: "inactive" }, "Admin Area"),
            Link({ href: "/admin", exact: true, activeClass: "active", inactiveClass: "inactive" }, "Admin Root"),
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
            Link({ href: "/dashboard", activeClass: "active" }, "Local Dashboard"),
            Link({ href: "/app/dashboard", activeClass: "active" }, "Full Dashboard"),
            Link({ href: "dashboard", activeClass: "active" }, "Relative Dashboard"),
            Link({ href: "/profile", activeClass: "active", inactiveClass: "inactive" }, "Local Profile"),
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

  describe("accessibility features", () => {
    it("should set aria-current='page' when link is active and has activeClass or ariaCurrent", () => {
      initRouter("/profile");
      const App = createComponent(
        () => Link({ href: "/profile", activeClass: "active" }, [$span({ textContent: "Profile" })]),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.getAttribute("aria-current")).toBe("page");
    });

    it("should omit aria-current when link is inactive", () => {
      initRouter("/home");
      const App = createComponent(() => Link({ href: "/profile" }, [$span({ textContent: "Profile" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");
      expect(anchor?.getAttribute("aria-current")).toBeNull();
    });

    it("should support custom ariaCurrent value or disabling it", () => {
      initRouter("/step-2");
      const App = createComponent(
        () =>
          $div({}, [
            Link({ href: "/step-2", ariaCurrent: "step" }, "Step 2"),
            Link({ href: "/step-2", ariaCurrent: false }, "No Current"),
          ]),
        "App",
      );

      unmount = mount(App, container);
      const links = container.querySelectorAll("a");
      expect(links[0].getAttribute("aria-current")).toBe("step");
      expect(links[1].getAttribute("aria-current")).toBeNull();
    });

    it("should handle disabled state and prevent navigation", () => {
      initRouter("/home");
      const App = createComponent(
        () => Link({ href: "/dashboard", disabled: true }, [$span({ textContent: "Dashboard" })]),
        "App",
      );

      unmount = mount(App, container);
      const anchor = container.querySelector("a")!;
      expect(anchor.getAttribute("aria-disabled")).toBe("true");
      expect(anchor.hasAttribute("data-disabled")).toBe(true);
      expect(anchor.getAttribute("href")).toBeNull();

      if (!isSSR) {
        anchor.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
        expect(navigateMock).not.toHaveBeenCalled();
      }
    });

    it("should support non-anchor elements with role='link' and keyboard activation", () => {
      initRouter("/home");
      const App = createComponent(
        () => Link({ href: "/settings", as: "div" }, [$span({ textContent: "Settings" })]),
        "App",
      );

      unmount = mount(App, container);
      const div = container.querySelector("[role='link']") as HTMLDivElement;
      expect(div).toBeTruthy();
      expect(div.tagName.toLowerCase()).toBe("div");
      expect(div.getAttribute("role")).toBe("link");
      expect(div.tabIndex).toBe(0);
      expect(div.getAttribute("href")).toBeNull();

      if (!isSSR) {
        const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
        div.dispatchEvent(enterEvent);
        expect(navigateMock).toHaveBeenCalledWith("/settings");
      }
    });
  });
});
