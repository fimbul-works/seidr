import { useHash } from "./use-hash";
import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";
import { useParams } from "./use-params";
import { useSearchParams } from "./use-search-params";

/**
 * Returns the router object with all common router hooks aggregated.
 */
export const useRouter = () => {
  const location = useLocation();
  const params = useParams();
  const hash = useHash();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    navigate,
    location,
    params,
    hash,
    searchParams,
    setSearchParams,
  };
};
