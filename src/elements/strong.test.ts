import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $strong } from "./strong";

describeDualMode("Strong Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $strong({}, ["Strong"]);
  });
});
