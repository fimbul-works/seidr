import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h6 } from "./h6";

describeDualMode("H6 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h6({}, ["Heading 6"]);
  });
});
