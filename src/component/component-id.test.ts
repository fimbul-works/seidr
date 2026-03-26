import { expect, it } from "vitest";
import { getAppState } from "../app-state/app-state";
import { describeDualMode } from "../test-setup/dual-mode";
import { component } from "./component";
import { componentWithId } from "./component-with-id";
import { DATA_NEXT_COMPONENT_ID } from "./constants";
import { consumeComponentId } from "./consume-component-id";
import type { ComponentReturnValue } from "./types";

describeDualMode("component IDs", () => {
  it("should consume and clear component ID override", () => {
    getAppState().setData(DATA_NEXT_COMPONENT_ID, 123);
    expect(consumeComponentId()).toBe(123);
    expect(consumeComponentId()).toBeUndefined();
  });

  it("should set component ID using componentWithId", () => {
    const factory = () => null;
    const comp1 = component(factory)();
    const comp2 = componentWithId(456, factory)();
    expect(comp2.numericId).not.toBe(comp1.numericId);
  });

  it("should handle ID collisions by using parent's next available child ID", () => {
    const Child = component(() => null, "Child");

    const Parent = component(() => {
      // Create first child with fixed ID
      const c1 = componentWithId(100, Child)();
      // Create second child with same fixed ID
      const c2 = componentWithId(100, Child)();

      return [c1.element, c2.element] as ComponentReturnValue;
    }, "Parent");

    const p = Parent();
    const children = Array.from(p.children.values());

    expect(children).toHaveLength(2);
    expect(children[0].id).not.toBe(children[1].id);
  });

  it("should handle string IDs in componentWithId", () => {
    const factory = () => null;
    const comp = componentWithId("custom-id", factory, "Named")();
    expect(comp.numericId).toBeTypeOf("number");
    expect(comp.id).toContain("Named-");
  });

  it("should mix parent ID with child ID for deterministic uniqueness", () => {
    const Child = component(() => null, "Child");

    const p1 = component(() => {
      const c1 = Child();
      const c2 = Child();
      return [c1.element, c2.element] as ComponentReturnValue;
    }, "Parent")();

    const p1Children = Array.from(p1.children.values());
    expect(p1Children[0].numericId).not.toBe(p1Children[1].numericId);
  });
});
