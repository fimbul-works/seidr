import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $sub } from "./sub";

describeDualMode("Subscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $sub({}, ["2"]);
  });
});
