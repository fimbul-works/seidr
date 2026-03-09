import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $section } from "./section";

describeDualMode("Section Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $section({ className: "content-section" }, ["Section content"]);
  });
});
