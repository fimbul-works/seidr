import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $var } from "./var";

describeDualMode("Variable Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $var({}, ["x"]);
  });
});
