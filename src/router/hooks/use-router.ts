import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";
import { useParams } from "./use-params";

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const persistState = () => {
    const scrollTop = document.scrollingElement?.scrollTop;
    const scrollLeft = document.scrollingElement?.scrollLeft;
    return { scrollTop, scrollLeft };
  }

  return {
    navigate,
    location,
    params,
  };
};
