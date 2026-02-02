/**
 * RenderContextStore manages ID generation for RenderContexts.
 * This is used to ensure isolation and determinism in SSR.
 */
export interface RenderContextStore {
  /** Current ID counter for RenderContexts */
  idCounter: number;
}

/**
 * RenderContext is used in server-side rendering.
 */
export interface RenderContext {
  /** Render context ID is used to differentiate render context between requests */
  ctxID: number;

  /** The root node for the current render context */
  rootNode?: Node;

  /** The global document object for this render context (SSR isolation) */
  document?: Document;

  /** Counter incremented when elements are reused during hydration */
  idCounter: number;

  /** Counter for generating unique Seidr instance IDs within this render context */
  seidrIdCounter: number;

  /** Counter for random number seed generation */
  randomCounter: number;

  /** State for the deterministic random number generator [s0, s1, s2, c] */
  randomState?: [number, number, number, number];

  /** Current URL path for routing (isolated per request in SSR) */
  currentPath: string;

  /** Callback to track promises for SSR waiting (optional) */
  onPromise?: (p: Promise<any>) => void;

  /** WeakMap to track which fragment owns which node (Context-Aware Fragment Tracking) */
  fragmentOwners: WeakMap<Node, any>;

  /** WeakMap to track children of a fragment when detached (Context-Aware Fragment Tracking) */
  fragmentChildren: WeakMap<any, Node[]>;
}
