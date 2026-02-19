import { $sub } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Subscript Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $sub({}, ["2"]);
  });
});
