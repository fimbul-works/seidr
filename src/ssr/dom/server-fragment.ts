import { uid } from "../../util/uid";
import { createServerNode } from "./server-node";
import { DOCUMENT_FRAGMENT_NODE, type NodeTypeDocumentFragment } from "./types";
import { nodeWithChildrenExtension, type ServerNodeWithChildren } from "./with-children";
import { nodeWithParentExtension, type ServerNodeWithParent } from "./with-parent";

export type ServerFragment = ServerNodeWithChildren<NodeTypeDocumentFragment> &
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
export function createServerDocumentFragment(id: string = uid()): ServerFragment {
  const node = createServerNode(DOCUMENT_FRAGMENT_NODE);
  const fragment = nodeWithParentExtension(nodeWithChildrenExtension(node));

  const startNode = { nodeType: 8, nodeValue: `s:${id}`, toString: () => `<!--s:${id}-->` };
  const endNode = { nodeType: 8, nodeValue: `e:${id}`, toString: () => `<!--e:${id}-->` };
  const originalInsertBefore = fragment.insertBefore;

  return Object.assign(fragment, {
    isSeidrFragment: true,
    id,
    get start() {
      return startNode;
    },
    get end() {
      return endNode;
    },
    insertBefore(node: any, ref: any) {
      if (ref === endNode) {
        (this as any).appendChild(node);
        return;
      }
      return originalInsertBefore.call(this, node, ref);
    },
    appendTo(parent: any) {
      parent.appendChild(startNode);
      for (const child of (this as any).childNodes) {
        parent.appendChild(child);
      }
      parent.appendChild(endNode);
    },
    toString() {
      const childrenStr = (this as any).childNodes
        .map((child: any) => {
          if (child.nodeType === 1) return child.outerHTML ?? (child.toString ? child.toString() : "");
          if (child.nodeType === 3) return child.nodeValue ?? "";
          if (child.nodeType === 8) return `<!--${child.nodeValue}-->`;
          if (child.toString && child.toString().indexOf("[object") === -1) {
            return child.toString();
          }
          return child.toString ? child.toString() : String(child);
        })
        .join("");
      return `<!--s:${this.id}-->${childrenStr}<!--e:${this.id}-->`;
    },
  }) as ServerFragment;
}
