import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $i } from "./i";

describeDualMode("Italic Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
