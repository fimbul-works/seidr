import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $samp } from "./samp";

describeDualMode("Sample Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $samp({}, ["Sample output"]);
  });
});
