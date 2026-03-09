import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $wbr } from "./wbr";

describeDualMode("Word Break Opportunity Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $wbr({});
  });
});
