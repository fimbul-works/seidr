import { getRenderContext } from "../../core/render-context-contract";
import type { SeidrComponent } from "./types";

/** Map of SeidrComponent stack by render context ID */
const renderScopeComponentStacks = new Map<number, SeidrComponent[]>();

/**
 * Get the component stack for a render context.
 * @returns {SeidrComponent[]} SeidrComponent stack
 */
export const getComponentStack = (): SeidrComponent[] => {
  const ctx = getRenderContext();
  const renderScopeID = ctx ? ctx.ctxID : 0;

  // Initialize component stack if needed
  if (!renderScopeComponentStacks.has(renderScopeID)) {
    renderScopeComponentStacks.set(renderScopeID, []);
  }
  return renderScopeComponentStacks.get(renderScopeID) as SeidrComponent[];
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
