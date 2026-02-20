import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $details } from "./details";
import { $p } from "./p";
import { $summary } from "./summary";

describeDualMode("Details Element Parity", () => {
  itHasParity("renders with open attribute", () => {
    return $details({ open: true }, [$summary({}, ["Summary content"]), $p({}, ["Detailed content"])]);
  });
});
