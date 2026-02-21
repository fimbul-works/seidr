import { DUMMY_URL } from "../constants";
import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

/**
 * Hook to manage search parameters.
 * @returns {[Seidr<Record<string, string>>, (key: string, value: string) => void]}
 * A tuple with a derived Seidr of search params and a function to set them.
 */
export const useSearchParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = location.as((path) => {
    const url = new URL(path, DUMMY_URL);
    return Object.fromEntries(url.searchParams.entries());
  });

  const setParam = (key: string, value: string) => {
    const url = new URL(location.value, DUMMY_URL);
    url.searchParams.set(key, value);
    navigate(url.pathname + url.search, true);
  };

  return [searchParams, setParam] as const;
};
