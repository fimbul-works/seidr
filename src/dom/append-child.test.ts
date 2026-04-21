import { describe, expect, it, vi } from "vitest";
import { component } from "../component";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { clearHydrationData, initHydrationData } from "../ssr/hydrate/storage";
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
    expect(parent.childNodes[0]).toBe(child1);
    expect(parent.childNodes[1]).toBe(child2);
  });

  it("should append a Seidr observable as a reactive text node", () => {
    const parent = $("div");
    const obs = new Seidr("initial");

    appendChild(parent, obs);
    expect(parent.textContent).toBe("initial");
    expect(obs.observerCount()).toBe(1);

    obs.value = "updated";
    expect(parent.textContent).toBe("updated");
  });

  it("should append a component with its start and end markers", () => {
    const parent = $("div");
    // Return an array with at least one element to force marker comments
    const Comp = component(() => [$("span", { textContent: "Inner" })], "Comp");
    const comp = Comp();

    appendChild(parent, comp);

    // Structure: <!--$Comp-ID--><span>Inner</span><!--/Comp-ID-->
    expect(parent.childNodes.length).toBe(3);
    expect(parent.childNodes[0].nodeType).toBe(8); // Comment
    expect(parent.childNodes[0].textContent).toBe(`$${comp.id}`);
    expect(parent.childNodes[1].nodeName).toBe("SPAN");
    expect(parent.childNodes[2].nodeType).toBe(8); // Comment
    expect(parent.childNodes[2].textContent).toBe(`/${comp.id}`);

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
    it("should skip appending if component is already mounted during hydration", () => {
      const parent = $("div");
      const Comp = component(() => $("span"), "Comp");
      const comp = Comp();
      comp.mount(parent); // Mark as mounted

      initHydrationData({ ctxID: 1, data: {}, components: {} });
      const insertSpy = vi.spyOn(parent, "insertBefore");

      appendChild(parent, comp);

      expect(insertSpy).not.toHaveBeenCalled();
      clearHydrationData();
    });

    it("should prevent hierarchy request error when appending parent to itself", () => {
      const parent = $("div");
      // This should normally throw in DOM if we try to append parent to itself
      // We want to verify Seidr's safety check prevents the call
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
