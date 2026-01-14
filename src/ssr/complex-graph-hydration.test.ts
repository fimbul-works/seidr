import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../core/dom/element";
import { Seidr } from "../core/seidr";
import { enableClientMode, enableSSRMode } from "../test-setup";
import { hydrate } from "./hydrate";
import { clearHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";

describe("Complex Graph Hydration (4+ levels)", () => {
  let cleanupMode: () => void;

  beforeEach(() => {
    cleanupMode = enableSSRMode();
  });

  afterEach(() => {
    cleanupMode();
    clearHydrationData();
  });

  it("should capture and hydrate a 4-level derivation chain", async () => {
    const App = () => {
      // Layer 0: Root observables
      const a = new Seidr(1);
      const b = new Seidr(2);
      const c = new Seidr(3);

      // Layer 1: First level derivations
      const ab = a.as((n) => n + b.value); // 1 + 2 = 3
      const bc = b.as((n) => n + c.value); // 2 + 3 = 5

      // Layer 2: Second level derivations
      const abc = a.as((n) => n + b.value + c.value); // 1 + 2 + 3 = 6

      // Layer 3: Third level derivations
      const sumOfSums = Seidr.computed(() => ab.value + bc.value, [ab, bc]); // 3 + 5 = 8

      // Layer 4: Fourth level derivation
      const final = sumOfSums.as((n) => n * 2); // 8 * 2 = 16

      return $("div", {}, [
        $("span", { textContent: a }),
        $("span", { textContent: b }),
        $("span", { textContent: c }),
        $("span", { textContent: ab }),
        $("span", { textContent: bc }),
        $("span", { textContent: abc }),
        $("span", { textContent: sumOfSums }),
        $("span", { textContent: final }),
      ]);
    };
    // Server-side rendering
    const { html, hydrationData } = await renderToString(App);

    // Verify HTML contains all values
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");
    expect(html).toContain(">3<"); // ab
    expect(html).toContain(">5<"); // bc
    expect(html).toContain(">6<"); // abc
    expect(html).toContain(">8<"); // sumOfSums
    expect(html).toContain(">16<"); // final

    // Verify hydration data has dependency graph
    // We have 8 Seidr instances (a, b, c, ab, bc, abc, sumOfSums, final)
    // Each .as() for textContent creates additional derived Seidr instances
    expect(hydrationData.graph.nodes.length).toBeGreaterThanOrEqual(8);

    // Only root observables should be captured (a, b, c)
    const observableValues = Object.values(hydrationData.observables);
    expect(observableValues).toContain(1);
    expect(observableValues).toContain(2);
    expect(observableValues).toContain(3);

    // Switch to client mode
    cleanupMode = enableClientMode();

    // Client-side hydration
    const container = document.createElement("div");
    const hydratedComponent = hydrate(App, container, hydrationData);

    expect(hydratedComponent).toBeDefined();

    // Verify all values are correctly hydrated
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("3");
    expect(container.textContent).toContain("3"); // ab
    expect(container.textContent).toContain("5"); // bc
    expect(container.textContent).toContain("6"); // abc
    expect(container.textContent).toContain("8"); // sumOfSums
    expect(container.textContent).toContain("16"); // final
  });

  it("should handle diamond dependencies correctly", async () => {
    const App = () => {
      // Diamond pattern:
      //     a
      //    / \
      //   ab   ac
      //    \ /
      //    abc

      const a = new Seidr(10);
      const b = new Seidr(5);
      const c = new Seidr(3);

      const ab = a.as((n) => n + b.value); // 10 + 5 = 15
      const ac = a.as((n) => n + c.value); // 10 + 3 = 13
      const abc = Seidr.computed(() => ab.value + ac.value, [ab, ac]); // 15 + 13 = 28

      return $("div", {}, [
        $("span", { textContent: ab }),
        $("span", { textContent: ac }),
        $("span", { textContent: abc }),
      ]);
    };
    // Server-side
    const { html, hydrationData } = await renderToString(App);

    expect(html).toContain(">15<"); // ab
    expect(html).toContain(">13<"); // ac
    expect(html).toContain(">28<"); // abc

    // Only a should be captured (it's the root that dependencies lead to)
    const observableValues = Object.values(hydrationData.observables);
    expect(observableValues).toContain(10);

    // Switch to client mode and hydrate
    cleanupMode = enableClientMode();
    const container = document.createElement("div");
    hydrate(App, container, hydrationData);

    expect(container.textContent).toContain("15");
    expect(container.textContent).toContain("13");
    expect(container.textContent).toContain("28");
  });

  it("should handle 5-level deep derivation chain", async () => {
    const App = () => {
      // Level 0: Roots
      const a = new Seidr(1);
      const b = new Seidr(1);

      // Level 1
      const l1_a = a.as((n) => n + 1); // 2
      const l1_b = b.as((n) => n + 1); // 2

      // Level 2
      const l2 = Seidr.computed(() => l1_a.value + l1_b.value, [l1_a, l1_b]); // 4

      // Level 3
      const l3 = l2.as((n) => n * 2); // 8

      // Level 4
      const l4 = l3.as((n) => n + 1); // 9

      // Level 5
      const l5 = l4.as((n) => n * 3); // 27

      return $("div", {}, [
        $("span", { textContent: l1_a }),
        $("span", { textContent: l1_b }),
        $("span", { textContent: l2 }),
        $("span", { textContent: l3 }),
        $("span", { textContent: l4 }),
        $("span", { textContent: l5 }),
      ]);
    };
    // Server-side
    const { html, hydrationData } = await renderToString(App);

    expect(html).toContain(">2<"); // l1_a
    expect(html).toContain(">2<"); // l1_b
    expect(html).toContain(">4<"); // l2
    expect(html).toContain(">8<"); // l3
    expect(html).toContain(">9<"); // l4
    expect(html).toContain(">27<"); // l5

    // Only roots (a, b) should be captured
    const observableValues = Object.values(hydrationData.observables);
    expect(observableValues).toEqual([1, 1]);

    // Switch to client mode and hydrate
    cleanupMode = enableClientMode();
    const container = document.createElement("div");
    hydrate(App, container, hydrationData);

    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("8");
    expect(container.textContent).toContain("9");
    expect(container.textContent).toContain("27");
  });
});
