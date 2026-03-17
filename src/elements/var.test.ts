import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $var } from "./var";

describeDualMode("Variable Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $var({}, ["x"]);
  });
});
