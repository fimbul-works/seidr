import { $section } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Section Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $section({ className: "content-section" }, ["Section content"]);
  });
});
