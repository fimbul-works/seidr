import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $fieldset } from "./fieldset";
import { $legend } from "./legend";

describeDualMode("Legend Element Parity", () => {
  itHasParity("renders in fieldset", () => {
    return $fieldset({}, [$legend({}, ["Details"])]);
  });
});
