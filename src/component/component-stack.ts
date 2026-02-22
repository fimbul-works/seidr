import { getRenderContextID } from "../render-context/render-context";
import type { Component } from "./types";

/** Map of current component cursor by render context ID */
const renderContextCursors = new Map<number, Component | null>();

/**
 * Get the current component from the component tree.
 * @returns {Component | null} Current Component cursor, or null.
 */
export const getCurrentComponent = (): Component | null => renderContextCursors.get(getRenderContextID()) ?? null;

/**
 * Pushes a component as the current context cursor.
 * @param {Component} component - The component to set as current.
 */
export const push = (component: Component): void =>
  renderContextCursors.set(getRenderContextID(), component) as any;

/**
 * Pops the current component cursor, moving up to the parent.
 */
export const pop = (): void => {
  const id = getRenderContextID();
  const current = renderContextCursors.get(id);
  if (current) {
    renderContextCursors.set(id, current.parent);
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
  const id = getRenderContextID();
  const previous = renderContextCursors.get(id) ?? null;
  try {
    renderContextCursors.set(id, component);
    return fn();
  } catch (error) {
    console.warn(error);
    return null as T;
  } finally {
    renderContextCursors.set(id, previous);
  }
};
