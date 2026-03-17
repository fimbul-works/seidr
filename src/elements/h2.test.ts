import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h2 } from "./h2";

describeDualMode("H2 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h2({}, ["Heading 2"]);
  });
});
