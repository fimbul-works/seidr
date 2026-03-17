import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $section } from "./section";

describeDualMode("Section Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $section({ className: "content-section" }, ["Section content"]);
  });
});
