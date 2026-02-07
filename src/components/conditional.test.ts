import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { Seidr } from "../seidr";
import { Conditional } from "./conditional";

describe("Conditional Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should render and toggle component based on condition", () => {
    const isVisible = new Seidr(false);
    const View = () => $("span", { textContent: "Visible" });

    const Parent = () => {
      return $("div", { className: "parent" }, [Conditional(isVisible, View)]);
    };

    mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain("<!--s:conditional-");
    expect(parentEl.innerHTML).not.toContain("Visible");

    isVisible.value = true;
    expect(parentEl.innerHTML).toContain("Visible");

    isVisible.value = false;
    expect(parentEl.innerHTML).not.toContain("Visible");
  });

  it("should call onAttached when component is shown", () => {
    const onAttached = vi.fn();
    const isVisible = new Seidr(false);

    const View = () => {
      const scope = useScope();
      scope.onAttached = (parent) => onAttached(parent);
      return $("span", { textContent: "Visible" });
    };

    const Parent = () => {
      return $("div", { className: "parent" }, [Conditional(isVisible, View)]);
    };

    mount(Parent, container);

    isVisible.value = true;
    expect(onAttached).toHaveBeenCalledWith(expect.anything());
  });

  it("should destroy scope when condition becomes false", () => {
    const isVisible = new Seidr(true);
    let scopeDestroyed = false;

    const View = () => {
      const scope = useScope();
      scope.track(() => (scopeDestroyed = true));
      return $("span", { textContent: "Visible" });
    };

    mount(() => Conditional(isVisible, View), container);

    isVisible.value = false;
    expect(scopeDestroyed).toBe(true);
  });
});
