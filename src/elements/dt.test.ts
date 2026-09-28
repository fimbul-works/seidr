import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $dt } from "./dt";

describeDualMode("Description Term Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $dt({ className: "term" }, ["Term"]);
  });
});
