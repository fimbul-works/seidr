import { getRenderContext } from "../render-context";
import { safe } from "../util/safe";
import type { Component } from "./types";

/** Map of current component cursor by render context ID */
const renderContextCursors = new Map<number, Component | null>();

/**
 * Get the current component from the component tree.
 * @returns {Component | null} Current Component cursor, or null.
 */
export const getCurrentComponent = (): Component | null => renderContextCursors.get(getRenderContext().ctxID) ?? null;

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 */
export const push = (component: Component): void =>
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
 * @param {Component} component - The component context to switch to.
 * @param {() => T} fn - The function to execute.
 * @returns {T} The result of the function.
 */
export const executeInContext = <T>(component: Component, fn: () => T): T => {
  const id = getRenderContext().ctxID;
  const previous = renderContextCursors.get(id) ?? null;
  return safe(
    () => (renderContextCursors.set(id, component), fn()),
    (error) => console.warn(error) as T,
    () => renderContextCursors.set(id, previous),
  ) as T;
};
