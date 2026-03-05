import { getAppState } from "../../app-state/app-state";
import { getRootComponent } from "../../component/component-stack";
import { useScope } from "../../component/use-scope";
import { NO_HYDRATE } from "../../seidr/constants";
import { Seidr } from "../../seidr/seidr";
import { isServer } from "../../util/environment/is-server";
import { HASH_SEIDR_ID } from "../constants";

/**
 * Returns the current hash as a derived Seidr.
 * This cannot be changed directly by the user.
 *
 * @returns {Seidr<string>} Derived Seidr of the current hash
 */
export const useHash = (): Seidr<string> => {
  const DATA_KEY = "seidr.router.hash";

  const appState = getAppState();
  const isInitialized = appState.hasData(DATA_KEY);

  // Create the hash seidr if not already initialized
  const hash: Seidr<string> = isInitialized
    ? appState.getData(DATA_KEY)!
    : new Seidr<string>(isServer() ? "" : window.location.hash, { ...NO_HYDRATE, id: HASH_SEIDR_ID });

  if (!isInitialized) {
    appState.setData(DATA_KEY, hash);
  }

  // Derived seidr for the specific component using the hook
  const derivedHash = hash.as((hash) => hash);

  // Clean up when the component unmounts
  const scope = useScope();
  scope.onUnmount(() => derivedHash.destroy());

  // Return the hash directly on the server
  if (isServer()) {
    return derivedHash;
  }

  // Add event listeners for hash changes if not already initialized
  if (!isInitialized) {
    // Minification shorthands
    const w = window;
    const listen = w.addEventListener.bind(w);
    const unlisten = w.removeEventListener.bind(w);
    const HASH_CHANGE = "hashchange";
    const POP_STATE = "popstate";
    const updateHashValue = () => (hash.value = window.location.hash);

    listen(HASH_CHANGE, updateHashValue);
    listen(POP_STATE, updateHashValue);

    // Clean up when the root component unmounts
    getRootComponent()?.onUnmount(() => {
      hash.destroy();
      unlisten(HASH_CHANGE, updateHashValue);
      unlisten(POP_STATE, updateHashValue);

      appState.deleteData(DATA_KEY);
    });
  }

  return derivedHash;
};
