import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";
import { useSearchParams } from "./use-search-params";

/**
 * Returns the router object.
 * @returns {Router} The router object
 */
export const useRouter = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const [queryParams, setQueryParam] = useSearchParams();

  return {
    ...location,
    ...navigation,
    setQueryParam,
    queryParams,
  };
};
