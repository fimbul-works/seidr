/** Storage: Map<renderScopeID, Map<symbol, any>> */
export const globalStates = new Map<number, Map<symbol, unknown>>();

/** Symbol name registry: Map<symbol, string> for serialization */
export const symbolNames = new Map<string, symbol>();
