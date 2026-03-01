import { component } from "../component/component";
import { $div } from "../elements/div";
import { $span } from "../elements/span";
import { renderToString } from "./render-to-string";

describe("SSR Execution Sequence Capture", () => {
  beforeEach(() => {
    process.env.SEIDR_TEST_SSR = "true";
  });

  afterEach(() => {
    delete process.env.SEIDR_TEST_SSR;
  });

  it("should capture simple element sequence", async () => {
    const TestComp = component(() => {
      return $div({}, [$span({}, "A"), "B"]);
    }, "TestComp");

    const { hydrationData } = await renderToString(TestComp);

    expect(hydrationData.components).toBeDefined();
    // Use Object.keys to find the component ID as it might have a counter
    const compId = Object.keys(hydrationData.components!).find((k) => k.startsWith("TestComp-"))!;
    const sequence = hydrationData.components![compId];

    // Order:
    // 1. text "A" (inside span)
    // 2. span (inside div)
    // 3. text "B" (inside div)
    // 4. div (root)

    expect(sequence).toHaveLength(4);

    expect(sequence[0][0]).toBe("#text"); // "A"
    expect(sequence[1][0]).toBe("span");
    expect(sequence[2][0]).toBe("#text"); // "B"
    expect(sequence[3][0]).toBe("div");

    // Paths
    // div is root, so root=[div element]
    // div's path should be []
    expect(sequence[3][1]).toEqual([]);

    // span is div's first child
    expect(sequence[1][1]).toEqual([0]);

    // text "A" is span's first child
    expect(sequence[0][1]).toEqual([0, 0]);

    // text "B" is div's second child
    expect(sequence[2][1]).toEqual([1]);
  });

  it("should handle nested components", async () => {
    const Child = component(({ name }: { name: string }) => {
      return $span({}, name);
    }, "Child");

    const Parent = component(() => {
      return $div({}, [Child({ name: "C1" }), Child({ name: "C2" })]);
    }, "Parent");

    const { hydrationData } = await renderToString(Parent);

    const parentId = Object.keys(hydrationData.components!).find((k) => k.startsWith("Parent-"))!;
    const child1Id = Object.keys(hydrationData.components!).find((k) => k.startsWith("Child-") && !k.endsWith("-2"))!;
    const child2Id = Object.keys(hydrationData.components!).find((k) => k.startsWith("Child-") && k.endsWith("-3"))!; // indices might vary depending on previous tests

    expect(hydrationData.components![parentId]).toBeDefined();
    expect(hydrationData.components![child1Id]).toBeDefined();
    expect(hydrationData.components![child2Id]).toBeDefined();
  });
});
