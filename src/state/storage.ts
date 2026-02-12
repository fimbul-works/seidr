import type { Seidr } from "../seidr/seidr";
import type { CleanupFunction } from "../types";
import type { StorageType } from "./types";

/** @type {Map<renderScopeID, Map<symbol, any>>} Global states */
export const globalStates = new Map<number, Map<symbol, Seidr>>();

/** @type {Map<symbol, string>} Symbol name registry */
export const symbolNames = new Map<string, symbol>();

/** @type {Map<symbol, [StorageType, CleanupFunction]>} Storage config and cleanup callbacks */
export const storageConfig = new Map<symbol, [StorageType, CleanupFunction]>();
