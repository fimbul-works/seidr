import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $strong } from "./strong";

describeDualMode("Strong Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $strong({}, ["Strong"]);
  });
});
