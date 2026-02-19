import { $i } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Italic Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
