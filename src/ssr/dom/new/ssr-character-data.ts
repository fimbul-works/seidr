import { TYPE_ELEMENT } from "../../../constants";
import type { NodeTypeComment, NodeTypeText } from "../../../types";
import { SSRChildNode } from "./ssr-child-node";

export abstract class SSRCharacterData<T extends NodeTypeComment | NodeTypeText>
  extends SSRChildNode<T>
  implements CharacterData
{
  constructor(
    public data: string,
    ownerDocument: Document,
  ) {
    super(ownerDocument);
  }

  get nodeValue(): string | null {
    return this.data;
  }

  set nodeValue(value: string | null) {
    this.data = value ?? "";
  }

  get ownerDocument(): Document {
    return this._ownerDocument!;
  }

  get textContent(): string {
    return this.data;
  }

  set textContent(value: string) {
    this.data = value;
  }

  get length(): number {
    return this.data.length;
  }

  get nextElementSibling(): Element | null {
    let node = this.nextSibling;
    while (node && node.nodeType !== TYPE_ELEMENT) {
      node = node.nextSibling;
    }
    return node as Element | null;
  }

  get previousElementSibling(): Element | null {
    let node = this.previousSibling;
    while (node && node.nodeType !== TYPE_ELEMENT) {
      node = node.previousSibling;
    }
    return node as Element | null;
  }

  substringData(offset: number, count: number): string {
    return this.data.substring(offset, offset + count);
  }

  appendData(data: string): void {
    this.data += data;
  }

  deleteData(offset: number, count: number): void {
    this.data = this.data.slice(0, offset) + this.data.slice(offset + count);
  }

  insertData(offset: number, data: string): void {
    this.data = this.data.slice(0, offset) + data + this.data.slice(offset);
  }

  replaceData(offset: number, count: number, data: string): void {
    this.data = this.data.slice(0, offset) + data + this.data.slice(offset + count);
  }

  isEqualNode(otherNode: Node | null): boolean {
    return otherNode?.nodeType === this.nodeType && this.data === (otherNode as SSRCharacterData<T>).data;
  }
}
