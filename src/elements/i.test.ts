import { $i } from "./i";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";

describeDualMode("Italic Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
