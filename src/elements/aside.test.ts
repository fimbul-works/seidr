import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $aside } from "./aside";

describeDualMode("Aside Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $aside({ id: "sidebar", className: "related-content" }, ["Related links"]);
  });
});
