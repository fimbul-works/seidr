import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $fieldset } from "./fieldset";
import { $legend } from "./legend";

describeDualMode("Legend Element Parity", () => {
  mockComponentScope();

  itHasParity("renders in fieldset", () => {
    return $fieldset({}, [$legend({}, ["Details"])]);
  });
});
