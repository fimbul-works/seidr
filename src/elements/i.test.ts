import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $i } from "./i";

describeDualMode("Italic Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $i({ className: "italic-text" }, ["Italic"]);
  });
});
