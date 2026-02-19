import { $dt } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Description Term Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $dt({ className: "term" }, ["Term"]);
  });
});
