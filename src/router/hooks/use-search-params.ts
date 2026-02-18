import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

export const useSearchParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setParam = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    navigate(url.pathname + url.search, { replace: true });
  };
  return [location.params, setParam];
}
