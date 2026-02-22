import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $rt } from "./rt";

describeDualMode("Ruby Text Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $rt({}, ["かん"]);
  });
});
