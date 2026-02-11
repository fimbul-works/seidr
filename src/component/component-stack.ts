import { getRenderContext } from "../render-context";
import { tryCatchFinally } from "../util/try-catch-finally";
import type { SeidrComponent } from "./types";

/** Map of current component cursor by render context ID */
const renderContextCursors = new Map<number, SeidrComponent | null>();

/**
 * Get the current component from the component tree.
 * @returns {SeidrComponent | null} Current SeidrComponent cursor, or null.
 */
export const getCurrentComponent = (): SeidrComponent | null =>
  renderContextCursors.get(getRenderContext().ctxID) ?? null;

/**
 * Pushes a component as the current context cursor.
 * @param {SeidrComponent} component - The component to set as current.
 */
export const push = (component: SeidrComponent): void =>
  renderContextCursors.set(getRenderContext().ctxID, component) as any;

/**
 * Pops the current component cursor, moving up to the parent.
 */
export const pop = (): void => {
  const id = getRenderContext().ctxID;
  const current = renderContextCursors.get(id);
  if (current) {
    renderContextCursors.set(id, current.scope.parent);
  }
};

/**
 * Executes a function within the context of a specific component.
 * Restores the previous context afterwards.
 *
 * @param {SeidrComponent} component - The component context to switch to.
 * @param {() => T} fn - The function to execute.
 * @returns {T} The result of the function.
 */
export const executeInContext = <T>(component: SeidrComponent, fn: () => T): T => {
  const id = getRenderContext().ctxID;
  const previous = renderContextCursors.get(id) ?? null;
  return tryCatchFinally(
    () => (renderContextCursors.set(id, component), fn()),
    () => renderContextCursors.set(id, previous),
    (error) => console.warn(error) as T,
  ) as T;
};
