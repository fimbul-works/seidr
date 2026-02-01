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

  // Initialize component stack if needed
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
  if (stack.length > 0) {
    return stack[stack.length - 1];
  }
  return null;
};
