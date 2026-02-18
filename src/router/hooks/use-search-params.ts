import { isClient } from "../../util/environment/client";
import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

export const useSearchParams = () => {
  const location = useLocation();
  const { navigate } = useNavigate();

  const setParam = (key: string, value: string) => {
    const url = new URL(location.href, isClient() ? window.location.origin : "http://fimbul.works/");
    url.searchParams.set(key, value);
    navigate(url.pathname + url.search, true);
  };

  return [location.queryParams, setParam] as const;
};
