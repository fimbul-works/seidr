import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $h1 } from "./h1";

describeDualMode("H1 Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $h1({}, ["Heading 1"]);
  });
});
