import { beforeEach, expect, it } from "vitest";
import { createComponent } from "../../component/create-component.js";
import { mount } from "../../dom/mount.js";
import { $div } from "../../elements/div.js";
import { clearTestAppState, describeDualMode } from "../../test-setup/index.js";
import { Router } from "../components/router.js";
import { getRouterState } from "../get-router-state.js";
import { clearRouterState } from "../test/index.js";
import { useNavigate } from "./use-navigate.js";
import { useSearchParams } from "./use-search-params.js";

describeDualMode("useSearchParams", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  it("should return reactive query params", () => {
    let params: any;
    let navigate: any;

    const TestComponent = createComponent(() => {
      [params] = useSearchParams();
      navigate = useNavigate();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    navigate("/?q=hello");
    expect(params().q).toBe("hello");
  });

  it("should update query params and reflect in Value", () => {
    let params: any;
    let setParam: any;

    const TestComponent = createComponent(() => {
      [params, setParam] = useSearchParams();
      return $div();
    });

    const App = () => Router([{ path: "/", component: TestComponent }]);

    mount(App, container);

    expect(params().new).toBeUndefined();

    setParam("new", "value");

    if (!isSSR) {
      expect(window.location.search).toContain("new=value");
    }
    expect(getRouterState().url().search).toContain("new=value");

    // The params Value should be updated automatically
    expect(params().new).toBe("value");
  });
});
