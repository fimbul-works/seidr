import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $noscript } from "./noscript";

describeDualMode("Noscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders fallback content", () => {
    return $noscript({}, ["JS disabled"]);
  });
});
