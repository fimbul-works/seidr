import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $strong } from "./strong";

describeDualMode("Strong Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $strong({}, ["Strong"]);
  });
});
