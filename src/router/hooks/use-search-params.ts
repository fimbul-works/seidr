import { isClient } from "../../util/environment/client";
import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

export const useSearchParams = () => {
  const location = useLocation();
  const { navigate } = useNavigate();

  const setParam = (key: string, value: string) => {
    const url = new URL(location.href, isClient() ? window.location.origin : "http://fimbul.works/");
    url.searchParams.set(key, value);
    console.log("setParam calling navigate:", url.pathname + url.search);
    // Use the pathname and search from the updated URL object
    navigate(url.pathname + url.search, true);
  };

  // Return a proxy that always reads from the current location.queryParams
  // This is necessary because location.queryParams is replaced on navigation,
  // making the destructured value stale if pointed to the old object.
  const paramsProxy = new Proxy({} as Record<string, string>, {
    get(target, prop, receiver) {
      if (prop === Symbol.iterator) return location.queryParams[Symbol.iterator];
      return location.queryParams[prop as string];
    },
    ownKeys() {
      return Reflect.ownKeys(location.queryParams);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(location.queryParams, prop);
    },
  });

  return [paramsProxy, setParam] as const;
};
