import { describe, expect, it } from "vitest";
import { TAG_COMPONET_PREFIX, TAG_TEXT } from "../../constants";
import type { HydrationData } from "../hydrate/types";
import { reconstructComponentTree } from "./reconstruct-component-tree";

describe("recontructComponentTree", () => {
  it("builds the correct virtual DOM tree from component hydration data", () => {
    const hydrationData: HydrationData = {
      state: {},
      components: {
        "BlogApp-1": [
          [`${TAG_COMPONET_PREFIX}Header-2`],
          [`${TAG_COMPONET_PREFIX}Router-5`],
          ["div", 1],
          [TAG_TEXT],
          ["footer", 3],
          ["div", 0, 2, 4],
        ],
        "Header-2": [
          [`${TAG_COMPONET_PREFIX}Link-3`],
          [`${TAG_COMPONET_PREFIX}Link-4`],
          [TAG_TEXT],
          ["a", 2],
          ["div", 1, 3],
          ["nav", 0, 4],
        ],
        "Link-3": [[TAG_TEXT], ["a", 0]],
        "Link-4": [[TAG_TEXT], ["a", 0]],
        "Router-5": [[`${TAG_COMPONET_PREFIX}HomePage-6`]],
        "HomePage-6": [[`${TAG_COMPONET_PREFIX}Suspense-7`]],
        "Suspense-7": [[`${TAG_COMPONET_PREFIX}Component-8`]],
        "Component-8": [[`${TAG_COMPONET_PREFIX}Switch-9`]],
        "Switch-9": [[`${TAG_COMPONET_PREFIX}Component-10`], [`${TAG_COMPONET_PREFIX}Component-11`]],
        "Component-10": [[TAG_TEXT], ["div", 0]],
        "Component-11": [[TAG_TEXT], ["h1", 0], [`${TAG_COMPONET_PREFIX}List-12`], ["ul", 2], ["div", 1, 3]],
        "List-12": [
          [`${TAG_COMPONET_PREFIX}PostCard-13`],
          [`${TAG_COMPONET_PREFIX}PostCard-16`],
          [`${TAG_COMPONET_PREFIX}PostCard-19`],
          [`${TAG_COMPONET_PREFIX}PostCard-22`],
        ],
        "PostCard-13": [
          [`${TAG_COMPONET_PREFIX}Link-14`],
          ["h2", 0],
          [TAG_TEXT],
          ["div", 2],
          ["div"],
          [`${TAG_COMPONET_PREFIX}Link-15`],
          ["li", 1, 3, 4, 5],
        ],
        "Link-14": [[TAG_TEXT], ["a", 0]],
        "Link-15": [[TAG_TEXT], ["a", 0]],
        "PostCard-16": [
          [`${TAG_COMPONET_PREFIX}Link-17`],
          ["h2", 0],
          [TAG_TEXT],
          ["div", 2],
          ["div"],
          [`${TAG_COMPONET_PREFIX}Link-18`],
          ["li", 1, 3, 4, 5],
        ],
        "Link-17": [[TAG_TEXT], ["a", 0]],
        "Link-18": [[TAG_TEXT], ["a", 0]],
        "PostCard-19": [
          [`${TAG_COMPONET_PREFIX}Link-20`],
          ["h2", 0],
          [TAG_TEXT],
          ["div", 2],
          ["div"],
          [`${TAG_COMPONET_PREFIX}Link-21`],
          ["li", 1, 3, 4, 5],
        ],
        "Link-20": [[TAG_TEXT], ["a", 0]],
        "Link-21": [[TAG_TEXT], ["a", 0]],
        "PostCard-22": [
          [`${TAG_COMPONET_PREFIX}Link-23`],
          ["h2", 0],
          [TAG_TEXT],
          ["div", 2],
          ["div"],
          [`${TAG_COMPONET_PREFIX}Link-24`],
          ["li", 1, 3, 4, 5],
        ],
        "Link-23": [[TAG_TEXT], ["a", 0]],
        "Link-24": [[TAG_TEXT], ["a", 0]],
      },
      ctxID: 0,
    };
    const tree = reconstructComponentTree(hydrationData.components);

    // Single root: BlogApp-1's outer div
    expect(tree).toHaveLength(1);
    const root = tree[0];
    expect(root.tag).toBe("div");
    expect(root.creationIndex).toBe(5);

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
    expect(mainContent.creationIndex).toBe(2);
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
    expect(footer.children![0].tag).toBe(TAG_TEXT);
  }); // it
});
