/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param {T} data - Data to handle
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for a Map key.
 */
export type MapKey = string | number | symbol;

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
  renderContextID: number;

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
}
