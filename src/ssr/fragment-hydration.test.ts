import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Conditional, List, Switch } from "../components";
import { type DOMFactory, getDOMFactory } from "../dom-factory";
import { $ } from "../element";
import { resetIdCounter } from "../render-context/render-context.node";
import { Seidr } from "../seidr";
import { enableClientMode, setRenderContextID } from "../test-setup";
import type { CleanupFunction } from "../types";
import { hydrate, resetHydratingFlag } from "./hydrate";
import { clearHydrationData } from "./hydration-context";
import { renderToString } from "./render-to-string";
import { setActiveSSRScope } from "./ssr-scope";

describe("Fragment Hydration", () => {
  let cleanupClientMode: CleanupFunction;
  let domFactory: DOMFactory;

  beforeEach(() => {
    cleanupClientMode = enableClientMode();
    setRenderContextID(0); // Reset ID for client
    domFactory = getDOMFactory();
  });

  afterEach(() => {
    clearHydrationData();
    resetHydratingFlag();
    cleanupClientMode();
    setActiveSSRScope(undefined);
    delete process.env.SEIDR_TEST_SSR;
  });

  it("should hydrate a component returning an array (Fragment)", async () => {
    resetIdCounter();
    const ArrayComponent = () => [$("span", { textContent: "one" }), $("span", { textContent: "two" })];

    // 1. SSR
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(ArrayComponent);
    expect(html).toContain("<!--s:");
    expect(html).toContain("<span>one</span><span>two</span>");
    expect(html).toContain("<!--e:");

    // 2. Hydration
    delete process.env.SEIDR_TEST_SSR;
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const unmount = hydrate(ArrayComponent, container, hydrationData);

    // Check that we reused the markers
    const startComment = container.firstChild as Comment;
    console.log("START NODE TYPE:", startComment.nodeType, startComment.nodeName, startComment.textContent);
    console.log("INNER HTML:", container.innerHTML);
    expect(startComment.nodeType).toBe(Node.COMMENT_NODE);
    expect(startComment.nodeValue).toContain("s:");

    unmount();
    expect(container.innerHTML).toBe("");
    document.body.removeChild(container);
  });

  it("should hydrate Conditional component", async () => {
    resetIdCounter();
    const show = new Seidr(true);
    const ConditionalApp = () => Conditional(show, () => $("div", { textContent: "visible" }));

    // 1. SSR
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(ConditionalApp);
    expect(html).toContain("conditional-");
    expect(html).toContain(">visible</div>");

    // 2. Hydration
    delete process.env.SEIDR_TEST_SSR;
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    hydrate(ConditionalApp, container, hydrationData);

    // Toggle state - should update via fragment
    show.value = false;
    expect(container.innerHTML).not.toContain(">visible</div>");
    expect(container.innerHTML).toContain("<!--s:conditional-");

    show.value = true;
    expect(container.innerHTML).toContain(">visible</div>");

    document.body.removeChild(container);
  });

  it("should hydrate List component", async () => {
    resetIdCounter();
    const items = new Seidr(["a", "b"]);
    const ListApp = () =>
      List(
        items,
        (i) => i,
        (i) => $("li", { textContent: i }),
      );

    // 1. SSR
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(ListApp);
    expect(html).toContain("list-");
    expect(html).toContain(">a</li>");
    expect(html).toContain(">b</li>");

    // 2. Hydration
    delete process.env.SEIDR_TEST_SSR;
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    hydrate(ListApp, container, hydrationData);

    // Reactive update after hydration
    items.value = ["b", "c"];
    expect(container.innerHTML).toContain(">b</li>");
    expect(container.innerHTML).toContain(">c</li>");
    expect(container.innerHTML).not.toContain(">a</li>");

    document.body.removeChild(container);
  });

  it("should hydrate Switch component", async () => {
    resetIdCounter();
    const mode = new Seidr("A");
    const SwitchApp = () =>
      Switch(mode, {
        A: () => $("div", { textContent: "Case A" }),
        B: () => $("div", { textContent: "Case B" }),
      });

    // 1. SSR
    process.env.SEIDR_TEST_SSR = "true";
    const { html, hydrationData } = await renderToString(SwitchApp);
    // expect(html).toContain("switch-");
    expect(html).toContain(">Case A</div>");

    // 2. Hydration
    delete process.env.SEIDR_TEST_SSR;
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    hydrate(SwitchApp, container, hydrationData);

    mode.value = "B";
    expect(container.innerHTML).toContain(">Case B</div>");
    expect(container.innerHTML).not.toContain(">Case A</div>");

    document.body.removeChild(container);
  });

  test("should recover if markers are stripped (fallback to append)", async () => {
    process.env.SEIDR_TEST_SSR = "true";
    const ArrayComponent = () => [$("span", { textContent: "A" }), $("span", { textContent: "B" })];
    const { html, hydrationData } = await renderToString(() => ArrayComponent());

    // Strip markers
    const strippedHtml = html.replace(/<!--[se]:[^>]+-->/g, "");
    expect(strippedHtml).toBe("<span>A</span><span>B</span>");

    // Hydrate
    process.env.SEIDR_TEST_SSR = "false";
    const container = document.createElement("div");
    container.innerHTML = strippedHtml;
    document.body.appendChild(container);

    const unmount = hydrate(ArrayComponent, container, hydrationData);

    // Should have appended new content with markers (since it couldn't find old one)
    // Result: A B <!--s--> A B <!--e-->
    // This is robust behavior (app works, even if content duplicated due to missing markers)
    // Note: because we couldn't find markers, we fell back to creating new ones.
    expect(container.innerHTML).toContain("<span>A</span><span>B</span><!--s:");
    expect(container.innerHTML).toContain("<!--e:");

    unmount();
    document.body.removeChild(container);
  });
});
