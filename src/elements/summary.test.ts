import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $details } from "./details";
import { $summary } from "./summary";

describeDualMode("Summary Element Parity", () => {
  mockUseScope();

  itHasParity("renders in details", () => {
    return $details({}, [$summary({}, ["Click to see more"])]);
  });
});
