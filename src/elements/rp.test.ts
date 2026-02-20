import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $rp } from "./rp";

describeDualMode("Ruby Parenthesis Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $rp({}, ["("]);
  });
});
