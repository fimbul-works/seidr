import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $rp } from "./rp";

describeDualMode("Ruby Parenthesis Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $rp({}, ["("]);
  });
});
