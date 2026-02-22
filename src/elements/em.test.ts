import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $em } from "./em";

describeDualMode("Emphasis Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $em({ id: "highlight" }, ["Emphasized"]);
  });
});
