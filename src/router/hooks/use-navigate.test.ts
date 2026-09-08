import { createComponent } from "../../component/create-component.js";
import { mount } from "../../dom/mount.js";
import { $div } from "../../elements/div.js";
import { describeDualMode } from "../../test-setup/dual-mode.js";
import { beforeEach, expect, it } from "vitest";
import { Router } from "../components/router.js";
import { initRouter } from "../init-router.js";
import { useNavigate } from "./use-navigate.js";
import { usePathname } from "./use-pathname.js";

describeDualMode("useNavigate", ({ getDocument }) => {
  let container: HTMLElement;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    initRouter("/");
  });

  it("should update currentPath value", () => {
    let navigate: any;
    let pathname: any;

    const TestComponent = createComponent(() => {
      navigate = useNavigate();
      pathname = usePathname();
      return $div();
    });

    const App = () =>
      Router([
        { path: "/", component: TestComponent },
        { path: "/about", component: TestComponent },
      ]);

    mount(App, container);

    navigate("/about");
    expect(pathname()).toBe("/about");
  });

  it("should preserve query params and hashes in the underlying URL state", () => {
    let navigate: any;
    const TestComponent = createComponent(() => {
      navigate = useNavigate();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    navigate("/about?foo=bar#baz");
  });

  it("should handle relative navigation with delta (go)", () => {
    let navigate: any;
    const TestComponent = createComponent(() => {
      navigate = useNavigate();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    expect(() => navigate(-1)).not.toThrow();
  });
});
