/**
 * RenderContext is used for SSR and hydration.
 */
export interface RenderContext {
  /** Render context ID is used to differentiate render context between requests */
  ctxID: number;

  /** The root node for the current render context */
  rootNode?: Node;

  /** The global document object for this render context (SSR isolation) */
  document?: Document;

  /** State for the deterministic random number generator [s0, s1, s2, c] */
  rngState?: [number, number, number, number];

  /** Current URL path for routing (isolated per request in SSR) */
  currentPath: string;

  /** Cache for marker comments indexed by component ID */
  markers: Map<string, [Comment, Comment]>;

  /** Callback to track promises for SSR waiting (optional) */
  onPromise?: (p: Promise<any>) => void;
}
