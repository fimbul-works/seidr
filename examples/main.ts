import {
  $button,
  $checkbox,
  $div,
  $form,
  $input,
  $li,
  $span,
  $ul,
  bindInput,
  cn,
  List,
  mount,
  Seidr,
  useLocation,
  useNavigate,
  useParams,
  useState,
} from "../src/index.core.js";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  console.log(location.toJSON());

  return $div({
    textContent: JSON.stringify({ location, navigate, params }),
  });
};

mount(App, document.body);
