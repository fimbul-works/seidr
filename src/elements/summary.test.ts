import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $details } from "./details";
import { $summary } from "./summary";

describeDualMode("Summary Element Parity", () => {
  mockComponentScope();

  itHasParity("renders in details", () => {
    return $details({}, [$summary({}, ["Click to see more"])]);
  });
});
