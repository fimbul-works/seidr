import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $em } from "./em";

describeDualMode("Emphasis Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $em({ id: "highlight" }, ["Emphasized"]);
  });
});
