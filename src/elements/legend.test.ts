import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $fieldset } from "./fieldset";
import { $legend } from "./legend";

describeDualMode("Legend Element Parity", () => {
  mockComponentScope();

  itHasParity("renders in fieldset", () => {
    return $fieldset({}, [$legend({}, ["Details"])]);
  });
});
