import { uid } from "../../util/uid";
import { createServerNode } from "./server-node";
import { DOCUMENT_FRAGMENT_NODE, type NodeTypeDocumentFragment } from "./types";
import { nodeWithChildElementNodesExtension, type ServerNodeWithChildElementNodes } from "./with-child-elements";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithParentExtension, type ServerNodeWithParent } from "./with-parent";

export type ServerFragment = ServerNodeWithChildElementNodes<NodeTypeDocumentFragment> &
  ServerNodeWithParent<NodeTypeDocumentFragment> & {
    readonly isSeidrFragment: true;
    readonly id: string;
    readonly start: any;
    readonly end: any;
  };

/**
 * Creates a server-side implementation of a persistent range (Fragment) for SSR.
 * Serializes to start and end markers: <!--s:id-->...<!--e:id-->
 *
 * @param id - Unique identifier for the fragment range
 * @returns The created server fragment
 * @internal
 */
export function createServerFragment(id: string = uid()): ServerFragment {
  const node = createServerNode(DOCUMENT_FRAGMENT_NODE);
  const fragment = nodeWithParentExtension(nodeWithChildElementNodesExtension(nodeWithChildNodesExtension(node)));

  return Object.assign(fragment, {
    isSeidrFragment: true,
    id,
    get start() {
      return { nodeType: 8, nodeValue: `s:${id}`, toString: () => `<!--s:${id}-->` };
    },
    get end() {
      return { nodeType: 8, nodeValue: `e:${id}`, toString: () => `<!--e:${id}-->` };
    },
    toString() {
      const childrenStr = this.childNodes.map((child: any) => child.toString()).join("");
      return `<!--s:${this.id}-->${childrenStr}<!--e:${this.id}-->`;
    },
  }) as ServerFragment;
}
