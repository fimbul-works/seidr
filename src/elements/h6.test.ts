import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $h6 } from "./h6";

describeDualMode("H6 Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $h6({}, ["Heading 6"]);
  });
});
