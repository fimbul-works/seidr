import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $mark } from "./mark";

describeDualMode("Mark Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with content", () => {
    return $mark({}, ["Highlighted"]);
  });
});
