import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $var } from "./var";

describeDualMode("Variable Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $var({}, ["x"]);
  });
});
