import { beforeEach, describe, expect, it } from "vitest";
import { createServerNode } from "./server-node";
import { ELEMENT_NODE } from "./types";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithElementPropertiesExtension } from "./with-element-properties";

describe("nodeWithElementPropertiesExtension", () => {
  let node: any;

  beforeEach(() => {
    const baseNode = createServerNode(ELEMENT_NODE, { tagName: "DIV" });
    node = nodeWithElementPropertiesExtension(nodeWithChildNodesExtension(baseNode));
  });

  it("should have correct tagName", () => {
    expect(node.tagName).toBe("DIV");
  });

  it("should handle textContent correctly", () => {
    node.textContent = "Hello World";
    expect(node.textContent).toBe("Hello World");
    expect(node.childNodes).toHaveLength(1);
    expect(node.childNodes[0].nodeValue).toBe("Hello World");
  });

  it("should handle innerHTML correctly", () => {
    node.innerHTML = "<span>Nested</span>";
    expect(node.innerHTML).toBe("<span>Nested</span>");
    expect(node.childNodes).toHaveLength(1);
    // innerHTML currently uses a mock node in with-element-properties.ts
    expect(node.childNodes[0].toString()).toBe("<span>Nested</span>");
  });

  it("should compute textContent from child nodes", () => {
    node.appendChild("Hello ");
    node.appendChild("World");
    expect(node.textContent).toBe("Hello World");
  });

  it("should compute innerHTML from child nodes", () => {
    const span = createServerNode(ELEMENT_NODE, { tagName: "span" });
    const spanWithProps = nodeWithElementPropertiesExtension(nodeWithChildNodesExtension(span));
    spanWithProps.textContent = "Inner";

    node.appendChild(spanWithProps);
    expect(node.innerHTML).toBe("<span>Inner</span>");
  });

  it("should render simple tag in toString()", () => {
    expect(node.toString()).toBe("<div></div>");
  });

  it("should render with id and className in toString()", () => {
    node.id = "test-id";
    node.className = "test-class";
    expect(node.toString()).toBe('<div id="test-id" class="test-class"></div>');
  });

  it("should handle void elements correctly in toString()", () => {
    const br = createServerNode(ELEMENT_NODE, { tagName: "br" });
    const brNode = nodeWithElementPropertiesExtension(nodeWithChildNodesExtension(br));
    expect(brNode.toString()).toBe("<br />");
  });
});
