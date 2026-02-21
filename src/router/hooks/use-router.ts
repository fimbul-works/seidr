import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";
import { useParams } from "./use-params";
import { useSearchParams } from "./use-search-params";

/**
 * Returns the router object with all common router hooks aggregated.
 */
export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    location,
    navigate,
    params,
    searchParams,
    setSearchParams,
  };
};
