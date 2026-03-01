import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { component } from "../../component/component";
import { $canvas, $div, $h1, $p, $section } from "../../elements";
import { enableSSRMode } from "../../test-setup/ssr-mode";
import { renderToString } from "../render-to-string";
import { renderStructureMapToTree, type StructureMapTuple, treeToStructureMap } from "./structure-map";

describe("buildStructureMap integration", () => {
  let restoreSSR: () => void;

  beforeEach(() => {
    restoreSSR = enableSSRMode();
  });

  afterEach(() => {
    restoreSSR();
  });

  it("builds a correct structure map end-to-end via renderToString", async () => {
    // We recreate the scenario from NEW_SSR.md
    const Message = component(({ text }: { text: string }) => {
      return $p(null, text);
    }, "Message");

    const TestComponent = component(() => {
      const canvas = $canvas({ id: "canvas" });

      return $div({ className: "view" }, [
        $section(null, [$h1(null, "Here is a player"), canvas, Message({ text: "Hello World" })]),
      ]);
    }, "TestComp");

    // renderToString expects the pure function or factory.
    // However, if we evaluate `TestComponent({})` outside, it throws Context errors.
    // Instead we can just pass the factory it can mount:
    const { hydrationData } = await renderToString(TestComponent);

    // Find the mapped IDs. We assume there's 'TestComp-1' and 'Message-2'
    const testCompId = Object.keys(hydrationData.components).find((id) => id.startsWith("TestComp"));
    expect(testCompId).toBeDefined();

    const structureMap = hydrationData.components[testCompId!];

    // Assert that the generated map perfectly matches the actual execution order:
    // 0: canvas (created first)
    // 1: h1 (created before its text)
    // 2: #text ("Here is a player")
    // 3: #component:2 (Message-2)
    // 4: section (created after its children are defined)
    // 5: div (created last)
    expect(structureMap).toEqual([
      ["canvas"], // 0
      ["h1", 2], // 1, child is #text(2)
      ["#text"], // 2
      [
        `#component:${
          Object.keys(hydrationData.components)
            .find((id) => id.startsWith("Message"))!
            .split("-")[1]
        }`,
      ], // 3
      ["section", 1, 0, 3], // 4, children are h1(1), canvas(0), and Message(3)
      ["div", 4], // 5, child is section(4)
    ]);
  });

  it("renders structure map to a tree for debugging", () => {
    const structureMap: StructureMapTuple[] = [
      ["canvas"], // 0
      ["#component:Comp-2"], // 1
      ["#text"], // 2
      ["h1", 2], // 3
      ["p", 5], // 4
      ["#text"], // 5
      ["section", 3, 0, 4], // 6
      ["div", 6], // 7
    ];

    const tree = renderStructureMapToTree(structureMap);

    expect(tree).toEqual([
      {
        _idx: 1,
        tag: "#component:Comp-2",
      },
      {
        _idx: 7,
        tag: "div",
        children: [
          {
            _idx: 6,
            tag: "section",
            children: [
              {
                _idx: 3,
                tag: "h1",
                children: [{ _idx: 2, tag: "#text" }],
              },
              {
                _idx: 0,
                tag: "canvas",
              },
              {
                _idx: 4,
                tag: "p",
                children: [{ _idx: 5, tag: "#text" }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("identifies structure map round-trip via tree conversion", () => {
    const originalMap: StructureMapTuple[] = [
      ["canvas"], // 0
      ["#component:2"], // 1
      ["#text"], // 2
      ["h1", 2], // 3
      ["p", 5], // 4
      ["#text"], // 5
      ["section", 3, 0, 4], // 6
      ["div", 6], // 7
    ];

    const tree = renderStructureMapToTree(originalMap);
    const roundTripMap = treeToStructureMap(tree);

    expect(roundTripMap).toEqual(originalMap);
  });
});
