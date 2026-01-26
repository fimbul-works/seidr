import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { useScope } from "../use-scope";
import { Conditional } from "./conditional";

describe("Conditional Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should render and toggle component based on condition", () => {
    const isVisible = new Seidr(false);
    const Child = component(() => $("span", { textContent: "Visible" }));

    const Parent = component(() => {
      return $("div", { className: "parent" }, [Conditional(isVisible, Child)]);
    });

    const parent = Parent();
    mount(parent, container);

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

    const Child = component(() => {
      const scope = useScope();
      scope.onAttached = onAttached;
      return $("span", { textContent: "Visible" });
    });

    const Parent = component(() => {
      return $("div", { className: "parent" }, [Conditional(isVisible, Child)]);
    });

    const parent = Parent();
    mount(parent, container);

    expect(onAttached).not.toHaveBeenCalled();

    isVisible.value = true;
    expect(onAttached).toHaveBeenCalled();
  });
});
