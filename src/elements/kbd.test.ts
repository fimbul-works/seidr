import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $kbd } from "./kbd";

describeDualMode("Keyboard Input Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $kbd({}, ["Ctrl + C"]);
  });
});
