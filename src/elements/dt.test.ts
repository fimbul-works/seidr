import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $dt } from "./dt";

describeDualMode("Description Term Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $dt({ className: "term" }, ["Term"]);
  });
});
