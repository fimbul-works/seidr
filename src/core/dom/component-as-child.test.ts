import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $, component, mount, Seidr } from "../index";

describe("Component as Child", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should allow SeidrComponent as a child in $ factory", () => {
    function Child() {
      return component(() => $("span", { textContent: "Child" }));
    }

    const parent = component(() => {
      const child = Child();
      return $("div", { className: "parent" }, [child]);
    });

    mount(parent, document.body);

    const parentEl = document.querySelector(".parent");
    expect(parentEl).toBeTruthy();
    expect(parentEl?.innerHTML).toBe("<span>Child</span>");

    parent.destroy();
  });

  it("should allow multiple SeidrComponents as children", () => {
    function Child(props: { name: string }) {
      return component(() => $("span", { textContent: props.name }));
    }

    const parent = component(() => {
      return $("div", { className: "parent" }, [Child({ name: "A" }), Child({ name: "B" })]);
    });

    mount(parent, document.body);

    const parentEl = document.querySelector(".parent");
    expect(parentEl?.innerHTML).toBe("<span>A</span><span>B</span>");

    parent.destroy();
  });
});
