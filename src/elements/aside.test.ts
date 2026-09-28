import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $aside } from "./aside";

describeDualMode("Aside Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $aside({ id: "sidebar", className: "related-content" }, ["Related links"]);
  });
});
