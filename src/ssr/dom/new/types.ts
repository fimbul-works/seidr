import type { NodeTypeComment, NodeTypeDocument, NodeTypeElement, NodeTypeText } from "../../../types";

/** Suppoted DOM node types for SSR */
export type SupportedNodeTypes = NodeTypeElement | NodeTypeText | NodeTypeComment | NodeTypeDocument;
