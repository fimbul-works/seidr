import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $section } from "./section";

describeDualMode("Section Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $section({ className: "content-section" }, ["Section content"]);
  });
});
