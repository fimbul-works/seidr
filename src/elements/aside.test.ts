import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $aside } from "./aside";

describeDualMode("Aside Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $aside({ id: "sidebar", className: "related-content" }, ["Related links"]);
  });
});
