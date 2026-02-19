import { $var } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Variable Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $var({}, ["x"]);
  });
});
