import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $sub } from "./sub";

describeDualMode("Subscript Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $sub({}, ["2"]);
  });
});
