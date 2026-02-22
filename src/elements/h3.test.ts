import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $h3 } from "./h3";

describeDualMode("H3 Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $h3({}, ["Heading 3"]);
  });
});
