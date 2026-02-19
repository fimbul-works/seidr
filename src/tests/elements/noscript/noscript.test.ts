import { $noscript } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Noscript Element Parity", () => {
  itHasParity("renders fallback content", () => {
    return $noscript({}, ["JS disabled"]);
  });
});
