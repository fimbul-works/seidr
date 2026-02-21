import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { component } from "../../component";
import { mount } from "../../dom";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { describeDualMode } from "../../test-setup";
import { Link } from "./link";

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock("../hooks/use-navigate", () => ({
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
    document.body.removeChild(container);
  });

  it("should render an anchor tag with correct href", () => {
    const App = component(() => Link({ to: "/users" }, [$("span", { textContent: "Users" })]), "App");

    unmount = mount(App, container);

    const anchor = container.querySelector("a");
    expect(anchor).toBeTruthy();
    expect(anchor?.textContent).toBe("Users");
    expect(anchor?.getAttribute("href")).toBe("/users");
  });

  if (!isSSR) {
    it("should call navigate on click", () => {
      const App = component(() => Link({ to: "/profile" }, [$("span", { textContent: "Profile" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");

      // Simulate click
      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));

      expect(navigateMock).toHaveBeenCalledWith("/profile");
    });

    it("should handle reactive 'to' prop", () => {
      const path = new Seidr("/initial");
      const App = component(() => Link({ to: path }, [$("span", { textContent: "Dynamic" })]), "App");

      unmount = mount(App, container);
      const anchor = container.querySelector("a");

      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
      expect(navigateMock).toHaveBeenCalledWith("/initial");

      path.value = "/updated";

      // Check if navigate uses updated value
      anchor?.dispatchEvent(new Event("click", { bubbles: true, cancelable: true }));
      expect(navigateMock).toHaveBeenCalledWith("/updated");
    });
  }
});
