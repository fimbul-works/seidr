import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $kbd } from "./kbd";

describeDualMode("Keyboard Input Element Parity", () => {
  mockUseScope();

  itHasParity("renders with content", () => {
    return $kbd({}, ["Ctrl + C"]);
  });
});
