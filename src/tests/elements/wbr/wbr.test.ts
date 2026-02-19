import { $wbr } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Word Break Opportunity Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $wbr({});
  });
});
