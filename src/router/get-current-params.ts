import { getRenderContext } from "../render-context/render-context";
import { NO_HYDRATE } from "../seidr/constants";
import { Seidr } from "../seidr/seidr";
import { isServer } from "../util/environment/server";

const PARAMS_SEIDR_ID = "router-params";

/** Map to cache Seidr instances per render context ID */
const paramsCache = new Map<number, Seidr<Record<string, string>>>();

/** Client-side params state (created once, reused across calls) */
let clientParamsState: Seidr<Record<string, string>> | undefined;

/** Clear cached params for a render context */
export const clearParamsCache = (ctxID: number) => paramsCache.delete(ctxID);

/** Reset client-side params state (for testing) */
export const resetClientParamsState = () => (clientParamsState = undefined);

/**
 * Get the reactive current params observable.
 *
 * On the client: Returns a module-level Seidr that persists across the session.
 * On the server: Returns a cached Seidr per render context (request-isolated).
 *
 * @returns {Seidr<Record<string, string>>} Reactive current params observable
 */
export const getCurrentParams = (): Seidr<Record<string, string>> => {
  if (isServer()) {
    const ctx = getRenderContext();
    const ctxID = ctx.ctxID;
    let observable = paramsCache.get(ctxID);

    if (!observable) {
      observable = new Seidr<Record<string, string>>({}, { ...NO_HYDRATE, id: PARAMS_SEIDR_ID });
      paramsCache.set(ctxID, observable);
    }

    return observable;
  }

  if (!clientParamsState) {
    clientParamsState = new Seidr<Record<string, string>>(
      {},
      {
        ...NO_HYDRATE,
        id: PARAMS_SEIDR_ID,
      },
    );
  }

  return clientParamsState;
};
