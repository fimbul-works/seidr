import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $b } from "./b";

describeDualMode("Bring Attention To Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $b({ id: "highlight", className: "bold-text" }, ["Attention"]);
  });
});
