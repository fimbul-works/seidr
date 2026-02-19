import { $strong } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Strong Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $strong({}, ["Strong"]);
  });
});
