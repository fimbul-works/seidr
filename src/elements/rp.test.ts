import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $rp } from "./rp";

describeDualMode("Ruby Parenthesis Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $rp({}, ["("]);
  });
});
