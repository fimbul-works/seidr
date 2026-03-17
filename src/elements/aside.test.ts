import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $aside } from "./aside";

describeDualMode("Aside Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $aside({ id: "sidebar", className: "related-content" }, ["Related links"]);
  });
});
