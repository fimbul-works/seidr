import { $em } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Emphasis Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $em({ id: "highlight" }, ["Emphasized"]);
  });
});
