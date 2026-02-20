import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $noscript } from "./noscript";

describeDualMode("Noscript Element Parity", () => {
  itHasParity("renders fallback content", () => {
    return $noscript({}, ["JS disabled"]);
  });
});
