import { inBrowser, inServer, isBrowser, isServer } from "../../ssr/env";
import { useScope } from "../dom";
import { Seidr } from "../seidr";
import { isUndefined } from "../util";
import type { StateKey } from "./types";
import { useState } from "./use-state";

export interface UseDataParams<T> {
  params?: any;
  server: (params?: any) => Promise<T>;
  client: (params?: any) => Promise<T>;
}

/**
 * @template T - state type
 *
 * @param {StateKey<T> | string} key - Key for the state
 * @param {UseDataParams<T>} params - Optional params for the data fetching
 * @returns {Promise<T>} Promise with the data
 */
export function useData<T>(key: StateKey<T> | string, { params, server, client }: UseDataParams<T>): Promise<T> {
  const [observable, setObservable] = useState(key);
  const scope = useScope();
  let result: Promise<T>;

  if (isServer()) {
    // Fetch data on server and store it in the observable
    result = inServer(async () => {
      const value = await server(params);
      if (!isUndefined(value)) {
        observable.value = value;
        setObservable(observable.value);
      }
      return value;
    });
    scope.waitFor(result);
  } else {
    // Fetch data on client if not already present
    result = inBrowser(async () => {
      if (!isUndefined(observable.value)) {
        return observable.value;
      } else {
        const value = await client(params);
        if (!isUndefined(value)) {
          observable.value = value;
          setObservable(observable.value);
        }
        return value;
      }
    });
  }

  return result;
}
