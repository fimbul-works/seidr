import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $rp } from "./rp";

describeDualMode("Ruby Parenthesis Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $rp({}, ["("]);
  });
});
