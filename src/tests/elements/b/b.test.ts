import { $b } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Bring Attention To Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $b({ id: "highlight", className: "bold-text" }, ["Attention"]);
  });
});
