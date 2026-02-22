import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $noscript } from "./noscript";

describeDualMode("Noscript Element Parity", () => {
  mockUseScope();

  itHasParity("renders fallback content", () => {
    return $noscript({}, ["JS disabled"]);
  });
});
