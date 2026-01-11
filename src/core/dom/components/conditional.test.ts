import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { Conditional } from "./conditional";

describe("Conditional Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should render and toggle component based on condition", () => {
    const isVisible = new Seidr(false);
    const Child = () => component(() => $("span", { textContent: "Visible" }));

    const Parent = component(() => {
      return $("div", { className: "parent" }, [Conditional(isVisible, Child)]);
    });

    mount(Parent, container);

    const parentEl = container.querySelector(".parent")!;
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");
    expect(parentEl.innerHTML).not.toContain("Visible");

    console.log(parentEl.innerHTML);
    isVisible.value = true;
    expect(parentEl.innerHTML).toContain("Visible");
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");

    isVisible.value = false;
    expect(parentEl.innerHTML).not.toContain("Visible");
    expect(parentEl.innerHTML).toContain("<!--seidr-conditional");
  });
});
