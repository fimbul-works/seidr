import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";
import { useSearchParams } from "./use-search-params";

/**
 * Returns the router object.
 * @returns {Router} The router object
 */
export const useRouter = () => {
  const location = useLocation();
  const { navigate, redirect, history } = useNavigate();
  const [_queryParams, setQueryParam] = useSearchParams();

  const router = {
    navigate,
    redirect,
    history,
    setQueryParam,
  };

  return new Proxy(location as any, {
    get(target, prop, _receiver) {
      if (prop === "navigate") return navigate;
      if (prop === "redirect") return redirect;
      if (prop === "history") return history;
      if (prop === "setQueryParam") return setQueryParam;

      return target[prop as keyof typeof target];
    },
    has(target, prop) {
      return (
        prop === "navigate" || prop === "redirect" || prop === "history" || prop === "setQueryParam" || prop in target
      );
    },
  });
};
