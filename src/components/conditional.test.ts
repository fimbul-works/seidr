import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { $ } from "../element";
import { mount } from "../mount";
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
    const Child = () => $("span", { textContent: "Visible" });

    const Parent = () => {
      return $("div", { className: "parent" }, [Conditional(isVisible, Child)]);
    };

    mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");
    expect(parentEl.innerHTML).not.toContain("Visible");

    isVisible.value = true;
    expect(parentEl.innerHTML).toContain("Visible");
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");

    isVisible.value = false;
    expect(parentEl.innerHTML).not.toContain("Visible");
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");
  });

  it("should call onAttached when component is shown", () => {
    const isVisible = new Seidr(false);
    const onAttached = vi.fn();

    const Child = () => {
      const scope = useScope();
      scope.onAttached = onAttached;
      return $("span", { textContent: "Visible" });
    };

    const Parent = () => {
      return $("div", { className: "parent" }, [Conditional(isVisible, Child)]);
    };

    mount(Parent, container);

    expect(onAttached).not.toHaveBeenCalled();

    isVisible.value = true;
    expect(onAttached).toHaveBeenCalled();
  });
});
