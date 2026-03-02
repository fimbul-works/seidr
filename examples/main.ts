import { $div, mount, useLocation, useNavigate, useParams } from "../src/index.core.js";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return $div({
    textContent: JSON.stringify({ location, navigate, params }),
  });
};

mount(App, document.body);
