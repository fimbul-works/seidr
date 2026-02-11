import type { Seidr } from "../seidr/seidr";

/** Storage: Map<renderScopeID, Map<symbol, any>> */
export const globalStates = new Map<number, Map<symbol, Seidr>>();

/** Symbol name registry: Map<symbol, string> for serialization */
export const symbolNames = new Map<string, symbol>();
