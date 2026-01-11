import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $, component } from "../core/index";
import { Seidr } from "../core/seidr";
import { enableSSRMode } from "../test-setup";
import { renderToString } from "./render-to-string";

/**
 * Comprehensive tests for Seidr registration logic
 *
 * These tests verify that the registration system works correctly regardless of:
 * - Where Seidr instances are created (inside/outside renderToString)
 * - The order in which they are observed
 * - The complexity of derived dependencies
 *
 * This aims to expose any fundamental flaws in the ID generation and
 * registration/hydration system.
 */
describe("Seidr Registration Logic - Comprehensive Tests", () => {
  let cleanupSSR: () => void;

  beforeEach(() => {
    cleanupSSR = enableSSRMode();
  });

  afterEach(() => {
    cleanupSSR();
  });

  /**
   * TEST 1: Basic scenario - Seidr created outside, observed inside
   */
  it("should register Seidr created outside renderToString when observed inside", async () => {
    // Create Seidr OUTSIDE renderToString
    const outsideCount = new Seidr(42);

    // Use it INSIDE renderToString
    const { html } = await renderToString(() => {
      return component(() => {
        outsideCount.observe((value) => {
          // Just observing to trigger registration
        });
        return $("div", {}, [`Count: ${outsideCount.value}`]);
      })();
    });

    // Should render correctly
    expect(html).toContain("Count: 42");
  });

  /**
   * TEST 2: Reverse order - observe Seidr created inside before outside
   */
  it("should handle registration when inside Seidr is observed before outside Seidr", async () => {
    const outsideSeidr = new Seidr(100);

    const { html } = await renderToString(() => {
      return component(() => {
        // Create Seidr INSIDE
        const insideSeidr = new Seidr(200);

        // Observe INSIDE first (reverse order)
        insideSeidr.observe(() => {});

        // Then observe OUTSIDE
        outsideSeidr.observe(() => {});

        return $("div", {}, [`A: ${insideSeidr.value}, B: ${outsideSeidr.value}`]);
      })();
    });

    expect(html).toContain("A: 200, B: 100");
  });

  /**
   * TEST 3: Multiple Seidr - some inside, some outside, observed in mixed order
   */
  it("should handle multiple Seidr created inside and outside with mixed observation order", async () => {
    // Create multiple OUTSIDE
    const outside1 = new Seidr("outside-1");
    const outside2 = new Seidr("outside-2");
    const outside3 = new Seidr("outside-3");

    const { html } = await renderToString(() => {
      return component(() => {
        // Create multiple INSIDE
        const inside1 = new Seidr("inside-1");
        const inside2 = new Seidr("inside-2");

        // Observe in mixed order: inside, outside, inside, outside
        inside2.observe(() => {});
        outside2.observe(() => {});
        inside1.observe(() => {});
        outside1.observe(() => {});

        return $("div", {}, [`${inside1.value} ${outside1.value} ${inside2.value} ${outside2.value}`]);
      })();
    });

    expect(html).toContain("inside-1 outside-1 inside-2 outside-2");
  });

  /**
   * TEST 4: Derived Seidr from outside parent, created inside
   */
  it("should register derived Seidr created inside from parent outside", async () => {
    const outsideCount = new Seidr(10);

    const { html } = await renderToString(() => {
      return component(() => {
        // Create derived INSIDE from OUTSIDE parent
        const doubled = outsideCount.as((n) => n * 2);

        // Observe derived
        doubled.observe(() => {});

        return $("div", {}, [`Doubled: ${doubled.value}`]);
      })();
    });

    expect(html).toContain("Doubled: 20");
  });

  /**
   * TEST 5: Multiple derived Seidr with complex dependencies
   */
  it("should handle multiple derived Seidr with complex dependencies across contexts", async () => {
    const base1 = new Seidr(5);
    const base2 = new Seidr(3);

    const { html } = await renderToString(() => {
      return component(() => {
        // First level derived
        const sum = Seidr.computed(() => base1.value + base2.value, [base1, base2]);

        // Second level derived (depends on first derived)
        const doubled = sum.as((n) => n * 2);

        // Observe in reverse dependency order
        doubled.observe(() => {});
        sum.observe(() => {});

        return $("div", {}, [`Sum: ${sum.value}, Doubled: ${doubled.value}`]);
      })();
    });

    expect(html).toContain("Sum: 8, Doubled: 16");
  });

  /**
   * TEST 6: Chain of .as() calls from outside parent
   */
  it("should handle chain of .as() calls from outside parent", async () => {
    const outsideCount = new Seidr(2);

    const { html } = await renderToString(() => {
      return component(() => {
        // Chain: outside -> inside1 -> inside2 -> inside3
        const doubled = outsideCount.as((n) => n * 2);
        const quadrupled = doubled.as((n) => n * 2);
        const octupled = quadrupled.as((n) => n * 2);

        // Observe in reverse order
        octupled.observe(() => {});
        quadrupled.observe(() => {});
        doubled.observe(() => {});

        return $("div", {}, [`${doubled.value} ${quadrupled.value} ${octupled.value}`]);
      })();
    });

    expect(html).toContain("4 8 16");
  });

  /**
   * TEST 7: Same Seidr observed multiple times
   */
  it("should handle same Seidr observed multiple times", async () => {
    const outsideCount = new Seidr(7);

    const { html } = await renderToString(() => {
      return component(() => {
        // Observe same Seidr multiple times
        const unsub1 = outsideCount.observe(() => {});
        const unsub2 = outsideCount.observe(() => {});
        const unsub3 = outsideCount.observe(() => {});

        // Cleanup some observers
        unsub2();

        return $("div", {}, [`Count: ${outsideCount.value}`]);
      })();
    });

    expect(html).toContain("Count: 7");
  });

  /**
   * TEST 8: Seidr created outside but not observed - should not affect rendering
   */
  it("should not register Seidr created outside but not observed", async () => {
    const outsideCount = new Seidr(42);

    const { html } = await renderToString(() => {
      return component(() => {
        // Create INSIDE Seidr
        const insideCount = new Seidr(100);

        // Only observe INSIDE
        insideCount.observe(() => {});

        // OUTSIDE is NOT observed

        return $("div", {}, [`Inside: ${insideCount.value}, Outside: ${outsideCount.value}`]);
      })();
    });

    // Should render correctly
    expect(html).toContain("Inside: 100, Outside: 42");
  });

  /**
   * TEST 9: Verify ID isolation across multiple renderToString calls
   */
  it("should maintain ID isolation across sequential renderToString calls", async () => {
    const sharedSeidr = new Seidr("shared");

    // First render
    const { html: html1 } = await renderToString(() => {
      return component(() => {
        const local1 = new Seidr("local-1");
        sharedSeidr.observe(() => {});
        local1.observe(() => {});
        return $("div", {}, [`${sharedSeidr.value} ${local1.value}`]);
      })();
    });

    // Second render - should start with fresh ID counter
    const { html: html2 } = await renderToString(() => {
      return component(() => {
        const local2 = new Seidr("local-2");
        sharedSeidr.observe(() => {});
        local2.observe(() => {});
        return $("div", {}, [`${sharedSeidr.value} ${local2.value}`]);
      })();
    });

    expect(html1).toContain("shared local-1");
    expect(html2).toContain("shared local-2");
  });

  /**
   * TEST 10: Bind with Seidr created outside
   */
  it("should bind correctly when Seidr created outside renderToString", async () => {
    const outsideCount = new Seidr(42);

    const { html } = await renderToString(() => {
      return component(() => {
        let boundValue = "";
        outsideCount.bind("", (value, _target) => {
          boundValue = String(value);
        });

        return $("div", {}, [`Count: ${boundValue}`]);
      })();
    });

    expect(html).toContain("Count: 42");
  });

  /**
   * TEST 11: Verify all Seidr get unique IDs regardless of creation location
   */
  it("should assign unique IDs to all Seidr instances", async () => {
    const outside1 = new Seidr(1);
    const outside2 = new Seidr(2);

    const ids = new Set<number>();

    const { html } = await renderToString(() => {
      return component(() => {
        const inside1 = new Seidr(3);
        const inside2 = new Seidr(4);

        // Collect all IDs
        ids.add(outside1.id);
        ids.add(outside2.id);
        ids.add(inside1.id);
        ids.add(inside2.id);

        // Trigger registration
        outside1.observe(() => {});
        inside2.observe(() => {});
        outside2.observe(() => {});
        inside1.observe(() => {});

        return $("div", {}, ["test"]);
      })();
    });

    // All IDs should be unique
    expect(ids.size).toBe(4);
  });

  /**
   * TEST 12: Seidr.computed with all parents outside, created inside
   */
  it("should handle Seidr.computed with all parents created outside", async () => {
    const firstName = new Seidr("John");
    const lastName = new Seidr("Doe");

    const { html } = await renderToString(() => {
      return component(() => {
        // Computed created INSIDE, parents OUTSIDE
        const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

        fullName.observe(() => {});

        return $("div", {}, [`Name: ${fullName.value}`]);
      })();
    });

    expect(html).toContain("Name: John Doe");
  });

  /**
   * TEST 13: Mixed: some parents inside, some outside
   */
  it("should handle Seidr.computed with mixed parent locations", async () => {
    const outsideBase = new Seidr(10);

    const { html } = await renderToString(() => {
      return component(() => {
        const insideBase = new Seidr(5);

        // Computed with mixed parents
        const sum = Seidr.computed(() => outsideBase.value + insideBase.value, [outsideBase, insideBase]);

        sum.observe(() => {});

        return $("div", {}, [`Sum: ${sum.value}`]);
      })();
    });

    expect(html).toContain("Sum: 15");
  });

  /**
   * TEST 14: Verify hydration data is captured correctly
   */
  it("should capture hydration data for Seidr created outside and observed inside", async () => {
    const outsideCount = new Seidr(42);

    const { html } = await renderToString(() => {
      return component(() => {
        outsideCount.observe(() => {});
        return $("div", {}, [`Count: ${outsideCount.value}`]);
      })();
    });

    // Verify HTML contains hydration data
    expect(html).toContain("data-seidr");
    expect(html).toContain("Count: 42");
  });

  /**
   * TEST 15: Multiple renderToString with overlapping Seidr sets
   */
  it("should handle overlapping Seidr sets across multiple renders", async () => {
    // Shared across all renders
    const shared = new Seidr("shared");

    // Used only in first
    const firstOnly = new Seidr("first");

    // Used only in second
    const secondOnly = new Seidr("second");

    const { html: html1 } = await renderToString(() => {
      return component(() => {
        shared.observe(() => {});
        firstOnly.observe(() => {});
        return $("div", {}, [`${shared.value} ${firstOnly.value}`]);
      })();
    });

    const { html: html2 } = await renderToString(() => {
      return component(() => {
        shared.observe(() => {});
        secondOnly.observe(() => {});
        return $("div", {}, [`${shared.value} ${secondOnly.value}`]);
      })();
    });

    const { html: html3 } = await renderToString(() => {
      return component(() => {
        shared.observe(() => {});
        firstOnly.observe(() => {});
        secondOnly.observe(() => {});
        return $("div", {}, [`${shared.value} ${firstOnly.value} ${secondOnly.value}`]);
      })();
    });

    expect(html1).toContain("shared first");
    expect(html2).toContain("shared second");
    expect(html3).toContain("shared first second");
  });
});
