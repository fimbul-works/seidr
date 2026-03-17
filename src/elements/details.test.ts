import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $details } from "./details";
import { $p } from "./p";
import { $summary } from "./summary";

describeDualMode("Details Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with open attribute", () => {
    return $details({ open: true }, [$summary({}, ["Summary content"]), $p({}, ["Detailed content"])]);
  });
});
