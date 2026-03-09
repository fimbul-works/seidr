import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $head } from "./head";

describeDualMode("Head Element Parity", () => {
  mockComponentScope();

  itHasParity("renders", () => {
    return $head;
  });
});
