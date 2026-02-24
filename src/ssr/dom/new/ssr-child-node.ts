import { SSRNode } from "./ssr-node";
import type { SupportedNodeTypes } from "./types";

export abstract class SSRChildNode<T extends SupportedNodeTypes> extends SSRNode<T> implements ChildNode {
  after(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.insertBefore(
        typeof node === "string" ? this.ownerDocument!.createTextNode(node) : node,
        this.nextSibling,
      );
    });
  }

  before(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.insertBefore(typeof node === "string" ? this.ownerDocument!.createTextNode(node) : node, this);
    });
  }

  remove(): void {
    this.parentNode?.removeChild(this);
  }

  replaceWith(...nodes: (Node | string)[]): void {
    if (!this.parentNode || !this.ownerDocument) {
      return;
    }

    nodes.forEach((node) => {
      this.parentNode!.replaceChild(typeof node === "string" ? this.ownerDocument!.createTextNode(node) : node, this);
    });
  }
}
