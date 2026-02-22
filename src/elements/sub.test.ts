import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $sub } from "./sub";

describeDualMode("Subscript Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $sub({}, ["2"]);
  });
});
