import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $em } from "./em";

describeDualMode("Emphasis Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $em({ id: "highlight" }, ["Emphasized"]);
  });
});
