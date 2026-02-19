import { $sup } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Superscript Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $sup({}, ["2"]);
  });
});
