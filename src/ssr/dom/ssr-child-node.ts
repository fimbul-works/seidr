import { isStr } from "../../util/type-guards/primitive-types";
import type { SSRDocument } from "./ssr-document";
import { SSRNode } from "./ssr-node";
import type { SupportedNodeTypes } from "./types";

export abstract class SSRChildNode<
    T extends SupportedNodeTypes = SupportedNodeTypes,
    D extends SSRDocument | null = SSRDocument | null,
  >
  extends SSRNode<T, D>
  implements ChildNode
{
  after(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.insertBefore(isStr(node) ? this.ownerDocument!.createTextNode(node) : node, this.nextSibling);
    });
  }

  before(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.insertBefore(isStr(node) ? this.ownerDocument!.createTextNode(node) : node, this);
    });
  }

  replaceWith(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.replaceChild(isStr(node) ? this.ownerDocument!.createTextNode(node) : node, this);
    });
  }

  remove(): void {
    this.parentNode?.removeChild(this);
  }
}
