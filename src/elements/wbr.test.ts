import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $wbr } from "./wbr";

describeDualMode("Word Break Opportunity Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $wbr({});
  });
});
