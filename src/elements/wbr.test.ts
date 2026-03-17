import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $wbr } from "./wbr";

describeDualMode("Word Break Opportunity Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $wbr({});
  });
});
