import { $br } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Break Element Parity", () => {
  itHasParity("renders basic br", () => {
    return $br();
  });

  itHasParity("renders with legacy clear attribute", () => {
    return $br({ clear: "all" as any });
  });
});
