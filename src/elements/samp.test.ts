import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $samp } from "./samp";

describeDualMode("Sample Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $samp({}, ["Sample output"]);
  });
});
