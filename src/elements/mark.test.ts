import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $mark } from "./mark";

describeDualMode("Mark Element Parity", () => {
  mockUseScope();

  itHasParity("renders with content", () => {
    return $mark({}, ["Highlighted"]);
  });
});
