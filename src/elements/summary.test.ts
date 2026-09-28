import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $details } from "./details";
import { $summary } from "./summary";

describeDualMode("Summary Element Parity", () => {
  itHasParity("renders in details", () => {
    return $details({}, [$summary({}, ["Click to see more"])]);
  });
});
