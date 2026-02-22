import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $small } from "./small";

describeDualMode("Small Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $small({}, ["Small text"]);
  });
});
