import { encodeBase62 } from "@fimbul-works/futhark";
import { getComponentScope } from "../component/component-scope.js";
import { useId } from "../hooks/use-id.js";
import { SeidrError } from "../types.js";
import { isServer } from "../util/environment/is-server.js";

/**
 * Generates the next available ID for a Value.
 *
 * @returns {string} Unique ID.
 */
export function nextUniqueId() {
  const scope = getComponentScope();
  if (scope) {
    return `${encodeBase62(scope.id)}-${encodeBase62(scope.nextValueId)}`;
  }

  if (isServer()) {
    if (process.env.VITEST) {
      console.warn("[seidr:error] nextUniqueId called outside of component scope");
    } else {
      throw new SeidrError("nextUniqueId called outside of component scope");
    }
  }

  return useId();
}
