import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $b } from "./b";

describeDualMode("Bring Attention To Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $b({ id: "highlight", className: "bold-text" }, ["Attention"]);
  });
});
