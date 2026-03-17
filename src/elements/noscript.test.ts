import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $noscript } from "./noscript";

describeDualMode("Noscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders fallback content", () => {
    return $noscript({}, ["JS disabled"]);
  });
});
