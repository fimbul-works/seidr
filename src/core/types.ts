/**
 * Type for event handlers that can be synchronous or asynchronous.
 *
 * @template T - The data type for the event
 * @param data - Data to handle
 */
export type EventHandler<T> = (data: T) => void | Promise<void>;

/**
 * Type for a Map key.
 */
export type MapKey = string | number | symbol;

/**
 * RenderContexxt is used in server-side rendering.
 */
export interface RenderContext {
  /** Render context ID is used to differentiate render context between requests */
  renderContextID: number;

  /** Counter incremented when elements are reused during hydration */
  idCounter: number;

  /** Counter for generating unique Seidr instance IDs within this render context */
  seidrIdCounter: number;

  /** Current URL path for routing (isolated per request in SSR) */
  currentPath: string;
}
