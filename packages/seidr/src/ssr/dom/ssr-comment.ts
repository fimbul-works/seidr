import { TAG_COMMENT, TYPE_COMMENT_NODE } from "../../constants.js";
import type { NodeTypeComment } from "../../types.js";
import { escapeHTML } from "../util/escape-string.js";
import { SSRCharacterData } from "./ssr-character-data.js";

export class SSRComment extends SSRCharacterData<NodeTypeComment> implements Comment {
  readonly nodeType = TYPE_COMMENT_NODE;

  get nodeName(): string {
    return TAG_COMMENT;
  }

  get mockComment(): Comment {
    return this as unknown as Comment;
  }

  cloneNode(): Node {
    return new SSRComment(this.data, this._ownerDocument);
  }

  toString(): string {
    return `<!--${escapeHTML(this.data)}-->`;
  }
}
