import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $address } from "./address";

describeDualMode("Address Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $address({ id: "office-address", className: "contact-info" }, ["123 Main St", "Anytown, USA"]);
  });
});
