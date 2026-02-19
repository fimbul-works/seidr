import { $aside } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Aside Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $aside({ id: "sidebar", className: "related-content" }, ["Related links"]);
  });
});
