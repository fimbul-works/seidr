import { beforeEach, describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { Switch } from "./switch";

describe("Switch Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should switch between components", () => {
    const mode = new Seidr("A");
    const CompA = component(() => $("span", { textContent: "View A" }));
    const CompB = component(() => $("span", { textContent: "View B" }));

    const Parent = component(() => {
      return $("div", { className: "parent" }, [
        Switch(mode, {
          A: CompA,
          B: CompB,
        }),
      ]);
    });

    const parent = Parent();
    mount(parent, container);

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
});
