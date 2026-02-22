import { createRenderFeature, getRenderFeature, type RenderFeature } from "../render-context/feature";
import { Seidr, unwrapSeidr } from "../seidr";
import { createStateKey } from "./create-state-key";
import { symbolNames } from "./storage";

const GLOBAL_STATE_FEATURE_ID = "seidr.state.global";

/**
 * Lazily creates and returns the global state feature.
 * @returns The global state feature.
 */
export const getGlobalStateFeature = (): RenderFeature<Map<symbol, Seidr<any>>, Record<string, unknown>> =>
  getRenderFeature<Map<symbol, Seidr<any>>, Record<string, unknown>>(GLOBAL_STATE_FEATURE_ID) ??
  createRenderFeature<Map<symbol, Seidr<any>>, Record<string, unknown>>({
    id: GLOBAL_STATE_FEATURE_ID,
    defaultValue: () => new Map(),
    serialize: (stateMap) => {
      const captured: Record<string, unknown> = {};
      const symbolToName = new Map<symbol, string>();
      for (const [name, sym] of symbolNames.entries()) {
        symbolToName.set(sym, name);
      }
      for (const [symbol, value] of stateMap.entries()) {
        if (value.isDerived) continue;
        const key = symbolToName.get(symbol);
        if (!key) continue;
        captured[key] = unwrapSeidr(value)!;
      }
      return captured;
    },
    deserialize: (serialized) => {
      const ctxStates = new Map<symbol, Seidr<any>>();
      for (const [key, value] of Object.entries(serialized)) {
        const targetSymbol = createStateKey(key);
        ctxStates.set(targetSymbol, new Seidr(value));
      }
      return ctxStates;
    },
  });
