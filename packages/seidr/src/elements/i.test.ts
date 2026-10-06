import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $i } from "./i";

describeDualMode("Italic Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
