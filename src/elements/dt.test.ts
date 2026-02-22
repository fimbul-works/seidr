import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $dt } from "./dt";

describeDualMode("Description Term Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $dt({ className: "term" }, ["Term"]);
  });
});
