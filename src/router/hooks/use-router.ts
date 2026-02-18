import { useLocation } from "./use-location";
import { useNavigate } from "./use-navigate";

export const useRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return {
    navigate,
    location,
  };
};
