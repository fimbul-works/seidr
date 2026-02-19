import { $rp } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Ruby Parenthesis Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $rp({}, ["("]);
  });
});
