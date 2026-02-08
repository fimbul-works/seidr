import { beforeEach, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { mount, SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../dom/internal";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { Conditional } from "./conditional";

describeDualMode("Conditional Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;

  beforeEach(() => {
    const doc = getDOMFactory().getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  it("should render and toggle component based on condition", () => {
    const isVisible = new Seidr(false);
    const View = () => $("span", { textContent: "Visible" });

    const Parent = () => $("div", { className: "parent" }, [Conditional(isVisible, View)]);

    mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}Conditional-`);
    expect(parentEl.innerHTML).toContain(`<!--${SEIDR_COMPONENT_END_PREFIX}Conditional-`);
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
