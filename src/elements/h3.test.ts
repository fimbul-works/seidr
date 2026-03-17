import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $h3 } from "./h3";

describeDualMode("H3 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h3({}, ["Heading 3"]);
  });
});
