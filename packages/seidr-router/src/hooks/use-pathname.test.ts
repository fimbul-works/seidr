import { createComponent, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { clearTestAppState } from "@fimbul-works/seidr/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { Router } from "../components/router.js";
import { useNavigate } from "./use-navigate.js";
import { usePathname } from "./use-pathname.js";
import { clearRouterState } from "../test/index.js";

describe("usePathname", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  it("should return current path as a Value", () => {
    let result: any;

    const TestComponent = createComponent(() => {
      result = usePathname();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    const cleanup = mount(App, container);
    expect(result()).toBe("/");

    cleanup();
  });

  it("should be reactive when path changes", () => {
    let result: any;
    let navigate: any;

    const TestComponent = createComponent(() => {
      result = usePathname();
      navigate = useNavigate();
      return $div();
    });

    const App = () =>
      Router([
        { path: "/", component: TestComponent },
        { path: "/about", component: TestComponent },
      ]);

    const cleanup = mount(App, container);
    expect(result()).toBe("/");

    navigate("/about");
    expect(result()).toBe("/about");

    cleanup();
  });

  it("should be read-only (derived)", () => {
    let result: any;

    const TestComponent = createComponent(() => {
      result = usePathname();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    const cleanup = mount(App, container);

    expect(result.isDerived).toBe(true);

    cleanup();
  });
});
