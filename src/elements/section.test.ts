import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $section } from "./section";

describeDualMode("Section Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $section({ className: "content-section" }, ["Section content"]);
  });
});
