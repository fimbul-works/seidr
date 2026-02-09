import { getRenderContext } from "../render-context";
import type { SeidrComponent } from "./types";

/** Map of SeidrComponent stack by render context ID */
const renderScopeComponentStacks = new Map<number, SeidrComponent[]>();

/**
 * Get the component stack for a render context.
 * @returns {SeidrComponent[]} SeidrComponent stack
 */
export const getComponentStack = (): SeidrComponent[] => {
  const ctxID = getRenderContext().ctxID;
  if (!renderScopeComponentStacks.has(ctxID)) {
    renderScopeComponentStacks.set(ctxID, []);
  }
  return renderScopeComponentStacks.get(ctxID) as SeidrComponent[];
};

/**
 * Get the current component from the component stack
 * @returns {SeidrComponent | null} Current SeidrComponent, or null if stack is empty
 */
export const getCurrentComponent = (): SeidrComponent | null => {
  const stack = getComponentStack();
  return stack.length > 0 ? stack[stack.length - 1] : null;
};
