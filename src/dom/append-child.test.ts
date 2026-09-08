import { encodeBase62 } from "@fimbul-works/futhark";
import { describe, expect, it, vi } from "vitest";
import { createComponent } from "../component";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../constants";
import { $ } from "../element";
import { createValue } from "../observable";
import { describeDualMode } from "../test-setup";
import { appendChild } from "./append-child";

describeDualMode("appendChild", ({ getDocument }) => {
  it("should append a simple element", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    const child = factory.createElement("span");
    appendChild(parent, child);
    expect(parent.childNodes.length).toBe(1);
    expect(parent.firstChild).toBe(child);
  });

  it("should append text as string", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    appendChild(parent, "hello");
    expect(parent.textContent).toBe("hello");
  });

  it("should append array of nodes", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    const child1 = factory.createElement("span");
    const child2 = factory.createElement("b");
    appendChild(parent, [child1, child2]);
    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0]).toBe(child1);
    expect(parent.childNodes[1]).toBe(child2);
  });

  it("should append a reactive Value with marker comments and update text", () => {
    const parent = $("div");
    const obs = createValue("initial");

    appendChild(parent, obs);
    expect(parent.textContent).toBe("initial");
    expect(obs.observerCount).toBe(1);

    // Structure: <!--$ID-->initial<!--/ID-->
    expect(parent.childNodes.length).toBe(3);
    expect(parent.childNodes[0].nodeType).toBe(8); // Start comment
    expect(parent.childNodes[0].textContent).toBe(`${SEIDR_COMPONENT_START_PREFIX}${obs.id}`);
    expect(parent.childNodes[1].textContent).toBe("initial");
    expect(parent.childNodes[2].nodeType).toBe(8); // End comment
    expect(parent.childNodes[2].textContent).toBe(`${SEIDR_COMPONENT_END_PREFIX}${obs.id}`);

    // Fast-path text update
    obs("updated");
    expect(parent.textContent).toBe("updated");
    expect(parent.childNodes.length).toBe(3);
  });

  it("should handle reactive Value returning DOM elements directly and swapping them", () => {
    const parent = $("div");
    const el1 = $("span", { textContent: "First Element" });
    const el2 = $("p", { textContent: "Second Element" });
    const obs = createValue<HTMLElement>(el1);

    appendChild(parent, obs);

    expect(parent.innerHTML).toContain("<span>First Element</span>");
    expect(parent.contains(el1)).toBe(true);

    // Swap to el2
    obs(el2);

    expect(parent.innerHTML).toContain("<p>Second Element</p>");
    expect(parent.contains(el1)).toBe(false);
    expect(parent.contains(el2)).toBe(true);
  });

  it("should handle reactive Value returning nullish values with empty marker comments", () => {
    const parent = $("div");
    const obs = createValue<HTMLElement | null>(null);

    appendChild(parent, obs);

    // Should only have start and end marker comments
    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0].textContent).toBe(`${SEIDR_COMPONENT_START_PREFIX}${obs.id}`);
    expect(parent.childNodes[1].textContent).toBe(`${SEIDR_COMPONENT_END_PREFIX}${obs.id}`);
    expect(parent.textContent).toBe("");

    // Toggle to element
    const el = $("button", { textContent: "Click Me" });
    obs(el);

    expect(parent.childNodes.length).toBe(3);
    expect(parent.contains(el)).toBe(true);
    expect(parent.textContent).toBe("Click Me");

    // Toggle back to null
    obs(null);
    expect(parent.childNodes.length).toBe(2);
    expect(parent.contains(el)).toBe(false);
    expect(parent.textContent).toBe("");
  });

  it("should handle reactive Value returning array of DOM elements", () => {
    const parent = $("div");
    const obs = createValue<HTMLElement[]>([$("span", { textContent: "A" }), $("span", { textContent: "B" })]);

    appendChild(parent, obs);

    expect(parent.querySelectorAll("span").length).toBe(2);
    expect(parent.textContent).toBe("AB");

    // Update with 3 elements
    obs([$("span", { textContent: "X" }), $("span", { textContent: "Y" }), $("span", { textContent: "Z" })]);

    expect(parent.querySelectorAll("span").length).toBe(3);
    expect(parent.textContent).toBe("XYZ");
  });

  it("should unmount components when reactive Value swaps them out", () => {
    const unmountSpy1 = vi.fn();
    const unmountSpy2 = vi.fn();

    const Comp1 = createComponent(() => {
      const el = $("div", { textContent: "Comp1" });
      return el;
    });

    const Comp2 = createComponent(() => {
      const el = $("div", { textContent: "Comp2" });
      return el;
    });

    const c1 = Comp1();
    c1.onUnmount(unmountSpy1);

    const c2 = Comp2();
    c2.onUnmount(unmountSpy2);

    const obs = createValue<any>(c1);
    const parent = $("div");

    appendChild(parent, obs);
    expect(parent.textContent).toBe("Comp1");

    // Swap to Comp2
    obs(c2);
    expect(parent.textContent).toBe("Comp2");
    expect(unmountSpy1).toHaveBeenCalled();
    expect(unmountSpy2).not.toHaveBeenCalled();

    // Swap to null
    obs(null);
    expect(parent.textContent).toBe("");
    expect(unmountSpy2).toHaveBeenCalled();
  });

  it("should support derived Value conditional switching (Show pattern)", () => {
    const isVisible = createValue(false);
    const view = isVisible.as((show) => (show ? $("span", { textContent: "Visible Content" }) : null));

    const parent = $("div");
    appendChild(parent, view);

    expect(parent.textContent).toBe("");

    isVisible(true);
    expect(parent.textContent).toBe("Visible Content");

    isVisible(false);
    expect(parent.textContent).toBe("");
  });

  it("should append a component with multiple nodes and markers", () => {
    const parent = $("div");
    const Comp = createComponent(() => [$("span", { textContent: "1" }), $("span", { textContent: "2" })], "Comp");
    const comp = Comp();

    appendChild(parent, comp);

    // Structure: <!--$Comp-ID--><span>1</span><span>2</span><!--/Comp-ID-->
    expect(parent.childNodes.length).toBe(4);
    expect(parent.childNodes[0].nodeType).toBe(8); // Comment
    expect(parent.childNodes[0].textContent).toBe(`$Comp-${encodeBase62(comp.id)}`);
    expect(parent.childNodes[3].nodeType).toBe(8); // Comment
    expect(parent.childNodes[3].textContent).toBe(`/Comp-${encodeBase62(comp.id)}`);

    expect(comp.isMounted).toBe(true);
  });

  it("should skip empty or whitespace-only children", () => {
    const parent = $("div");
    appendChild(parent, null);
    appendChild(parent, undefined);
    appendChild(parent, "   ");
    expect(parent.childNodes.length).toBe(0);
  });

  describe("Hydration & Safety", () => {
    it("should prevent hierarchy request error when appending parent to itself", () => {
      const parent = $("div");
      const appendSpy = vi.spyOn(parent, "appendChild");

      appendChild(parent, parent);

      expect(appendSpy).not.toHaveBeenCalled();
    });

    it("should prevent hierarchy request error when appending ancestor to descendant", () => {
      const ancestor = $("div", { id: "ancestor" });
      const descendant = $("div", { id: "descendant" });
      ancestor.appendChild(descendant);

      const appendSpy = vi.spyOn(descendant, "appendChild");

      appendChild(descendant, ancestor);

      expect(appendSpy).not.toHaveBeenCalled();
    });
  });
});
