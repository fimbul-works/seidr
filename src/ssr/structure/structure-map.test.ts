import { describe, expect, it } from "vitest";
import { BlogApp } from "../../../examples/ssr/app";
import { component } from "../../component";
import { TAG_COMMENT, TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import { $text } from "../../dom/node/text";
import { $canvas } from "../../elements/canvas";
import { $div } from "../../elements/div";
import { $h1 } from "../../elements/h1";
import { $section } from "../../elements/section";
import { enableSSRMode } from "../../test-setup/ssr-mode";
import type { HydrationData } from "../hydrate/types";
import { renderToString } from "../render-to-string";
import { buildDomTree, renderStructureMapToTree, type StructureMapTuple } from "./structure-map";

describe("SSR structure map integration", () => {
  it("builds a correct structure map end-to-end via renderToString", async () => {
    const cleanup = enableSSRMode();
    try {
      const Message = component(({ text }: { text: string }) => {
        return $text(text);
      }, "Message");

      const TestComp = component(() => {
        return $div({}, [$section({}, [$h1({}, "Title"), $canvas({}), Message({ text: "Hello" })])]);
      }, "TestComp");

      const { hydrationData } = await renderToString(TestComp);
      const testCompEntryId = Object.keys(hydrationData.components).find((id) => id.startsWith("TestComp"));
      expect(testCompEntryId).toBeDefined();
      const structureMap = hydrationData.components[testCompEntryId!];

      // Structure map in new format: [tag, ...childIndices] — no domIndex, no redundant markers.
      // Nodes are indexed in creation order within the component (children created before parents).
      expect(structureMap).toEqual([
        [TAG_TEXT], // 0: text "Title", created first inside h1
        ["h1", 0], // 1: h1 with text child at idx 0
        ["canvas"], // 2: canvas, no children
        [`${TAG_COMPONET_PREFIX}Message-2`], // 3: Message-2 boundary
        ["section", 1, 2, 3], // 4: section with children h1(1), canvas(2), Message-2(3)
        ["div", 4], // 5: div with section child at idx 4
      ]);
    } finally {
      cleanup();
    }
  });
});

describe("renderStructureMapToTree", () => {
  it("correctly identifies roots and sorts them by creation index", () => {
    const map: StructureMapTuple[] = [
      ["span", 2], // 0: root, child at idx 2 (text)
      ["div"], // 1: root, no children
      [TAG_TEXT], // 2: child of span (idx 0), no children
    ];

    const tree = renderStructureMapToTree(map);

    // Roots: span (0) and div (1). text (2) is a child of span so excluded from roots.
    expect(tree).toHaveLength(2);
    expect(tree[0]._idx).toBe(0);
    expect(tree[1]._idx).toBe(1);
    expect(tree[0].tag).toBe("span");
    expect(tree[1].tag).toBe("div");
  });
});

describe("buildDomTree", () => {
  it("builds the correct virtual DOM tree from component hydration data", () => {
    const hydrationData: HydrationData = {
      state: {},
      components: {
        "BlogApp-1": [
          ["#component:Header-2"],
          ["#component:Router-5"],
          ["div", 1],
          ["#text"],
          ["footer", 3],
          ["div", 0, 2, 4],
        ],
        "Header-2": [["#component:Link-3"], ["#component:Link-4"], ["#text"], ["a", 2], ["div", 1, 3], ["nav", 0, 4]],
        "Link-3": [["#text"], ["a", 0]],
        "Link-4": [["#text"], ["a", 0]],
        "Router-5": [["#component:HomePage-6"]],
        "HomePage-6": [["#component:Suspense-7"]],
        "Suspense-7": [["#component:Component-8"]],
        "Component-8": [["#component:Switch-9"]],
        "Switch-9": [["#component:Component-10"], ["#component:Component-11"]],
        "Component-10": [["#text"], ["div", 0]],
        "Component-11": [["#text"], ["h1", 0], ["#component:List-12"], ["ul", 2], ["div", 1, 3]],
        "List-12": [
          ["#component:PostCard-13"],
          ["#component:PostCard-16"],
          ["#component:PostCard-19"],
          ["#component:PostCard-22"],
        ],
        "PostCard-13": [
          ["#component:Link-14"],
          ["h2", 0],
          ["#text"],
          ["div", 2],
          ["div"],
          ["#component:Link-15"],
          ["li", 1, 3, 4, 5],
        ],
        "Link-14": [["#text"], ["a", 0]],
        "Link-15": [["#text"], ["a", 0]],
        "PostCard-16": [
          ["#component:Link-17"],
          ["h2", 0],
          ["#text"],
          ["div", 2],
          ["div"],
          ["#component:Link-18"],
          ["li", 1, 3, 4, 5],
        ],
        "Link-17": [["#text"], ["a", 0]],
        "Link-18": [["#text"], ["a", 0]],
        "PostCard-19": [
          ["#component:Link-20"],
          ["h2", 0],
          ["#text"],
          ["div", 2],
          ["div"],
          ["#component:Link-21"],
          ["li", 1, 3, 4, 5],
        ],
        "Link-20": [["#text"], ["a", 0]],
        "Link-21": [["#text"], ["a", 0]],
        "PostCard-22": [
          ["#component:Link-23"],
          ["h2", 0],
          ["#text"],
          ["div", 2],
          ["div"],
          ["#component:Link-24"],
          ["li", 1, 3, 4, 5],
        ],
        "Link-23": [["#text"], ["a", 0]],
        "Link-24": [["#text"], ["a", 0]],
      },
      ctxID: 11,
    };
    const tree = buildDomTree(hydrationData.components);

    console.log(JSON.stringify(tree, null, 2));
    // Single root: BlogApp-1's outer div
    expect(tree).toHaveLength(1);
    const root = tree[0];
    expect(root.tag).toBe("div");
    expect(root._idx).toBe(5);

    // Outer div has three children: Header-2, div.main-content (with Router-5 injected), footer
    expect(root.children).toHaveLength(3);
    const [header, mainContent, footer] = root.children!;

    // Header-2 component expands into Header-2's own subtree
    expect(header.tag).toBe(`${TAG_COMPONET_PREFIX}Header-2`);
    expect(header.id).toBe("Header-2");
    // Header-2's root is a nav containing Link-3, div (which contains Link-4 and a)
    const headerNav = header.children![0];
    expect(headerNav.tag).toBe("nav");

    // div.main-content has Router-5 injected as its child (orphan resolution)
    expect(mainContent.tag).toBe("div");
    expect(mainContent._idx).toBe(2);
    expect(mainContent.children).toHaveLength(1);
    const router = mainContent.children![0];
    expect(router.tag).toBe(`${TAG_COMPONET_PREFIX}Router-5`);
    expect(router.id).toBe("Router-5");

    // Router-5 → HomePage-6 → Suspense-7 → Component-8 → Switch-9
    // Switch-9 has two alternatives (pending and resolved) as roots
    const homePage = router.children![0];
    expect(homePage.id).toBe("HomePage-6");
    const suspense = homePage.children![0];
    expect(suspense.id).toBe("Suspense-7");
    const comp8 = suspense.children![0];
    expect(comp8.id).toBe("Component-8");
    const switchNode = comp8.children![0];
    expect(switchNode.id).toBe("Switch-9");
    // Switch has two alternative states as roots: pending (Component-10) and resolved (Component-11)
    expect(switchNode.children).toHaveLength(2);
    expect(switchNode.children![0].id).toBe("Component-10");
    expect(switchNode.children![1].id).toBe("Component-11");

    // footer
    expect(footer.tag).toBe("footer");
    expect(footer.children).toHaveLength(1);
    expect(footer.children![0].tag).toBe("#text");
  }); // it
});
