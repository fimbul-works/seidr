import { TYPE_TEXT_NODE } from "../../../constants";
import type { NodeTypeText } from "../../../types";
import { escapeHTML } from "../../../util/escape";
import { SSRCharacterData } from "./ssr-character-data";

export class SSRTextNode extends SSRCharacterData<NodeTypeText> implements Text {
  readonly nodeType = TYPE_TEXT_NODE;

  get nodeName(): string {
    return "#text";
  }

  get mockText(): Text {
    return this as unknown as Text;
  }

  get wholeText(): string {
    return this.data;
  }

  get assignedSlot(): HTMLSlotElement | null {
    return null;
  }

  splitText(offset: number): Text {
    if (!this.parentNode) {
      throw new Error("Cannot split text node without a parent node");
    }
    const newTextNode = new SSRTextNode(this.data.slice(offset), this._ownerDocument);
    this.data = this.data.slice(0, offset);
    this.parentNode.insertBefore(newTextNode, this.nextSibling);
    return newTextNode;
  }

  cloneNode(): Node {
    return new SSRTextNode(this.data, this._ownerDocument);
  }

  toString(): string {
    return escapeHTML(this.data);
  }
}
