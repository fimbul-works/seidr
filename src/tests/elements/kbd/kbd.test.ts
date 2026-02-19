import { $kbd } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Keyboard Input Element Parity", () => {
  itHasParity("renders with content", () => {
    return $kbd({}, ["Ctrl + C"]);
  });
});
