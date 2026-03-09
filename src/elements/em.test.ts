import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $em } from "./em";

describeDualMode("Emphasis Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $em({ id: "highlight" }, ["Emphasized"]);
  });
});
