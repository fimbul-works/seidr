import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $fieldset } from "./fieldset";
import { $legend } from "./legend";

describeDualMode("Legend Element Parity", () => {
  mockUseScope();

  itHasParity("renders in fieldset", () => {
    return $fieldset({}, [$legend({}, ["Details"])]);
  });
});
