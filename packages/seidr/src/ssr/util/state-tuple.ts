/**
 * Hydration state tuple format:
 * [UniqueValue, ...referencingValueIDs]
 *
 * If UniqueValue is an array, its elements are integer indices pointing
 * to other tuples in the payload array.
 */
export type HydrationStateTuple = [value: any, ...valueIds: string[]];

/**
 * The complete hydration state payload for DATA_KEY_STATE.
 */
export type HydrationStatePayload = HydrationStateTuple[];

/**
 * Packs reactive Value state into a deduplicated tuple array.
 *
 * Arrays have their elements recursively registered into the unique values table,
 * and the array stores the indices of those unique values.
 *
 * When multiple reactive Values share the same value reference in memory
 * (such as Suspense and a userland store), the value is stored once,
 * and all referencing Value IDs are appended to that single tuple.
 *
 * @param {Map<string, any>} values - Map of Value.ID to unwrapped value
 * @returns {HydrationStatePayload} Deduplicated tuple payload
 */
export function packHydrationState(values: Map<string, any>): HydrationStatePayload {
  const payload: HydrationStatePayload = [];
  const indexMap = new Map<any, number>();
  const idSets = new Map<number, Set<string>>();

  function register(val: any, valueId?: string): number {
    if (indexMap.has(val)) {
      const idx = indexMap.get(val)!;
      if (valueId) {
        const idSet = idSets.get(idx);
        if (idSet && !idSet.has(valueId)) {
          idSet.add(valueId);
          payload[idx].push(valueId);
        }
      }
      return idx;
    }

    const idx = payload.length;
    indexMap.set(val, idx);
    idSets.set(idx, valueId ? new Set([valueId]) : new Set());

    if (Array.isArray(val)) {
      // 1. Reserve slot in payload so idx matches payload[idx]
      const tuple: HydrationStateTuple = valueId ? [[], valueId] : [[]];
      payload.push(tuple);

      // 2. Map children (if a child cyclically references val, indexMap already has it)
      const childIndices = val.map((child) => register(child));

      // 3. Fill the reserved slot with the child indices
      tuple[0] = childIndices;
      return idx;
    }

    // Primitives and opaque objects
    const tuple: HydrationStateTuple = valueId ? [val, valueId] : [val];
    payload.push(tuple);
    return idx;
  }

  for (const [id, value] of values.entries()) {
    register(value, id);
  }

  return payload;
}

/**
 * Unpacks a deduplicated hydration state tuple array into a lookup Map.
 *
 * Uses a two-pass algorithm (allocate containers, then populate contents)
 * to resolve all array indices and preserve circular references and object identity.
 *
 * @param {HydrationStatePayload} payload - The tuple payload to unpack
 * @returns {Map<string, any>} Map of Value.ID to restored value instance
 */
export function unpackHydrationState(payload: HydrationStatePayload): Map<string, any> {
  const restoredValues = new Map<number, any>();
  const clientMap = new Map<string, any>();

  if (!Array.isArray(payload)) {
    return clientMap;
  }

  // PASS 1: Allocate instances and bind Value.IDs
  for (let i = 0; i < payload.length; i++) {
    const tuple = payload[i];
    const rawVal = tuple[0];

    // Allocate an empty array for array slots, or take the literal value
    const instance = Array.isArray(rawVal) ? [] : rawVal;
    restoredValues.set(i, instance);

    for (let j = 1; j < tuple.length; j++) {
      clientMap.set(tuple[j], instance);
    }
  }

  // PASS 2: Populate array elements by dereferencing indices
  for (let i = 0; i < payload.length; i++) {
    const rawVal = payload[i][0];
    if (Array.isArray(rawVal)) {
      const targetArray = restoredValues.get(i);
      for (let k = 0; k < rawVal.length; k++) {
        targetArray.push(restoredValues.get(rawVal[k]));
      }
    }
  }

  return clientMap;
}
