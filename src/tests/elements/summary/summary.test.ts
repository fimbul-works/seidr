import { $ } from "../../../element/create-element";
import { $summary } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Summary Element Parity", () => {
  itHasParity("renders in details", () => {
    return $("details", {}, [$summary({}, ["Click to see more"])]);
  });
});
