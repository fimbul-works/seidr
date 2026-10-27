import { encodeBase62 } from "@fimbul-works/futhark";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setComponentScope } from "../component/component-scope";
import { createComponent } from "../component/create-component";
import { $ } from "../element";
import { enableClientMode, enableSSRMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { nextUniqueId } from "./next-unique-id";

describe("nextUniqueId", () => {
  let restore: CleanupFunction;

  beforeEach(() => {
    restore = enableClientMode();
  });

  afterEach(() => {
    restore();
  });

  it("should generate deterministic IDs within component scope", () => {
    const TestComp = createComponent(() => {
      const id1 = nextUniqueId();
      const id2 = nextUniqueId();
      return $("div", { id: id1, className: id2 });
    }, "Test");

    const comp1 = TestComp();
    const el1 = comp1.nodes[0] as HTMLElement;

    // ID format is: [ComponentIDBase62]-[CounterBase62]
    expect(el1.id).toBe(`${encodeBase62(comp1.id)}-1`);
    expect(el1.className).toBe(`${encodeBase62(comp1.id)}-2`);

    const comp2 = TestComp();
    const el2 = comp2.nodes[0] as HTMLElement;
    expect(el2.id).toBe(`${encodeBase62(comp2.id)}-1`);
  });

  it("should fallback to AppState counter when outside of scope", () => {
    setComponentScope(null);

    const id = nextUniqueId();
    expect(id).toBeTruthy();
  });

  it("should throw on server when outside of scope (warn in test)", () => {
    const cleanup = enableSSRMode();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      setComponentScope(null);
      nextUniqueId();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("outside of component scope"));
    } finally {
      cleanup();
      consoleSpy.mockRestore();
    }
  });
});
