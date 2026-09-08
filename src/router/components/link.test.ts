import { createComponent } from "../../component/create-component.js";
import { mount } from "../../dom/mount.js";
import { $span } from "../../elements/span.js";
import { createValue } from "../../observable/value.js";
import { describeDualMode } from "../../test-setup/dual-mode.js";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Link } from "./link.js";

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
});
