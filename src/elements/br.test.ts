import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $br } from "./br";

describeDualMode("Break Element Parity", () => {
  mockComponentScope();

  itHasParity("renders basic br", () => {
    return $br();
  });

  itHasParity("renders with legacy clear attribute", () => {
    return $br({ clear: "all" });
  });
});
