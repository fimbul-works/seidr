import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $details } from "./details";
import { $summary } from "./summary";

describeDualMode("Summary Element Parity", () => {
  mockComponentScope();

  itHasParity("renders in details", () => {
    return $details({}, [$summary({}, ["Click to see more"])]);
  });
});
