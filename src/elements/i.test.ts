import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $i } from "./i";

describeDualMode("Italic Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
