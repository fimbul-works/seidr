import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $samp } from "./samp";

describeDualMode("Sample Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $samp({}, ["Sample output"]);
  });
});
