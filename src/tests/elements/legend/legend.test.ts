import { $ } from "../../../element/create-element";
import { $legend } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Legend Element Parity", () => {
  itHasParity("renders in fieldset", () => {
    return $("fieldset", {}, [$legend({}, ["Details"])]);
  });
});
