import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h4 } from "./h4";

describeDualMode("H4 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h4({}, ["Heading 4"]);
  });
});
