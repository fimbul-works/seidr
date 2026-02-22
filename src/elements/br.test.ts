import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $br } from "./br";

describeDualMode("Break Element Parity", () => {
  mockUseScope();

  itHasParity("renders basic br", () => {
    return $br();
  });

  itHasParity("renders with legacy clear attribute", () => {
    return $br({ clear: "all" });
  });
});
