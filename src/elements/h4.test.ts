import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $h4 } from "./h4";

describeDualMode("H4 Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $h4({}, ["Heading 4"]);
  });
});
