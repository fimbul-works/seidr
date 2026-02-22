import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $h6 } from "./h6";

describeDualMode("H6 Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $h6({}, ["Heading 6"]);
  });
});
