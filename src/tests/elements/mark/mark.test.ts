import { $mark } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Mark Element Parity", () => {
  itHasParity("renders with content", () => {
    return $mark({}, ["Highlighted"]);
  });
});
