import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { Seidr } from "../seidr";
import { Switch } from "./switch";

describe("Switch Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should switch between components", () => {
    const mode = new Seidr("A");
    const CompA = () => $("span", { textContent: "View A" });
    const CompB = () => $("span", { textContent: "View B" });

    const Parent = () => {
      return $("div", { className: "parent" }, [
        Switch(mode, {
          A: CompA,
          B: CompB,
        }),
      ]);
    };

    mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain("View A");
    expect(parentEl.innerHTML).toContain("<!--seidr-switch");

    mode.value = "B";
    expect(parentEl.innerHTML).toContain("View B");
    expect(parentEl.innerHTML).not.toContain("View A");

    mode.value = "C"; // No match
    expect(parentEl.innerHTML).not.toContain("View B");
    expect(parentEl.innerHTML).toContain("<!--seidr-switch");
  });

  it("should call onAttached when switching components", () => {
    const onAttached = vi.fn();
    const mode = new Seidr("A");

    const CompA = () => {
      const scope = useScope();
      scope.onAttached = () => onAttached("A");
      return $("span", { textContent: "View A" });
    };

    const CompB = () => {
      const scope = useScope();
      scope.onAttached = () => onAttached("B");
      return $("span", { textContent: "View B" });
    };

    const Parent = () => {
      return $("div", { className: "parent" }, [
        Switch(mode, {
          A: CompA,
          B: CompB,
        }),
      ]);
    };

    mount(Parent, container);
    expect(onAttached).toHaveBeenCalledWith("A");

    onAttached.mockClear();
    mode.value = "B";
    expect(onAttached).toHaveBeenCalledWith("B");
  });
});
