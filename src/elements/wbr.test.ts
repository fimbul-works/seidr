import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $wbr } from "./wbr";

describeDualMode("Word Break Opportunity Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $wbr({});
  });
});
