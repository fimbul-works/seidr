import { $samp } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Sample Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $samp({}, ["Sample output"]);
  });
});
