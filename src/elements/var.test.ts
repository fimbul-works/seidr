import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $var } from "./var";

describeDualMode("Variable Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $var({}, ["x"]);
  });
});
