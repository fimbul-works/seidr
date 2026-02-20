import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $kbd } from "./kbd";

describeDualMode("Keyboard Input Element Parity", () => {
  itHasParity("renders with content", () => {
    return $kbd({}, ["Ctrl + C"]);
  });
});
