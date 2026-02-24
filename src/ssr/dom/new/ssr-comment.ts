import { TYPE_COMMENT_NODE } from "../../../constants";
import type { NodeTypeComment } from "../../../types";
import { escapeHTML } from "../../../util/escape";
import { SSRCharacterData } from "./ssr-character-data";

export class SSRComment extends SSRCharacterData<NodeTypeComment> implements Comment {
  readonly nodeType = TYPE_COMMENT_NODE;

  get nodeName(): string {
    return "#comment";
  }

  cloneNode(): Node {
    return new SSRComment(this.data, this.ownerDocument);
  }

  toString(): string {
    return `<!--${escapeHTML(this.data)}-->`;
  }
}
