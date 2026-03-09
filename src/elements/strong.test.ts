import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $strong } from "./strong";

describeDualMode("Strong Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $strong({}, ["Strong"]);
  });
});
