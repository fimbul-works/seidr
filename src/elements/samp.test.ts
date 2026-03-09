import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $samp } from "./samp";

describeDualMode("Sample Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $samp({}, ["Sample output"]);
  });
});
