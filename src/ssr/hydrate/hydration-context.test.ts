import { describe, expect, it } from "vitest";
import type { StructureMapTuple } from "../structure/structure-map";
import { HydrationContext, resolveNodes } from "./hydration-context";

describe("HydrationContext and resolveNodes", () => {
  it("resolves a simple flat structure", () => {
    // <div><span></span></div>
    const structureMap: StructureMapTuple[] = [
      ["span"], // 0, child of 1
      ["div", 0], // 1, root
    ];

    const div = document.createElement("div");
    const span = document.createElement("span");
    div.appendChild(span);

    const resolved = resolveNodes(structureMap, [div]);

    expect(resolved[1]).toBe(div);
    expect(resolved[0]).toBe(span);
  });

  it("resolves a complex nested structure with text and components", () => {
    // <div data-seidr-id="1">
    //   <section>
    //     <h1>Title</h1>
    //     <canvas></canvas>
    //     <!--#Message-2-->
    //   </section>
    // </div>
    const structureMap: StructureMapTuple[] = [
      ["canvas"], // 0
      ["#text"], // 1
      ["h1", 1], // 2
      ["#component:2"], // 3
      ["section", 2, 0, 3], // 4
      ["div", 4], // 5
    ];

    const div = document.createElement("div");
    const section = document.createElement("section");
    const h1 = document.createElement("h1");
    const textNode = document.createTextNode("Title");
    const canvas = document.createElement("canvas");
    const marker = document.createComment("#Message-2");

    div.appendChild(section);
    section.appendChild(h1);
    h1.appendChild(textNode);
    section.appendChild(canvas);
    section.appendChild(marker);

    const resolved = resolveNodes(structureMap, [div]);

    expect(resolved[5]).toBe(div);
    expect(resolved[4]).toBe(section);
    expect(resolved[2]).toBe(h1);
    expect(resolved[1]).toBe(textNode);
    expect(resolved[0]).toBe(canvas);
    expect(resolved[3]).toBe(marker);
  });

  it("HydrationContext claims nodes in order", () => {
    const structureMap: StructureMapTuple[] = [["span"], ["div", 0]];
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.appendChild(span);

    const ctx = new HydrationContext("Test-1", structureMap, [div]);

    expect(ctx.peek()).toBe(span);
    expect(ctx.claim()).toBe(span);
    expect(ctx.peek()).toBe(div);
    expect(ctx.claim()).toBe(div);
    expect(ctx.isDone).toBe(true);
  });

  it("claims component boundaries correctly", () => {
    const structureMap: StructureMapTuple[] = [["#component:2"], ["div", 0]];
    const div = document.createElement("div");
    const marker = document.createComment("#Message-2");
    div.appendChild(marker);

    const ctx = new HydrationContext("Test-1", structureMap, [div]);

    const claimed = ctx.claimBoundary("Message-2");
    expect(claimed).toBe(marker);
    expect(ctx.peek()).toBe(div);
  });
});
