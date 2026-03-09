import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $kbd } from "./kbd";

describeDualMode("Keyboard Input Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $kbd({}, ["Ctrl + C"]);
  });
});
