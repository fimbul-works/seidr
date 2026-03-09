import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $sub } from "./sub";

describeDualMode("Subscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $sub({}, ["2"]);
  });
});
