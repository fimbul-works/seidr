import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $dt } from "./dt";

describeDualMode("Description Term Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $dt({ className: "term" }, ["Term"]);
  });
});
