import { $rt } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Ruby Text Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $rt({}, ["かん"]);
  });
});
