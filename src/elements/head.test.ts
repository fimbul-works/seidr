import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $head } from "./head";

describeDualMode("Head Element Parity", () => {
  mockComponentScope();

  itHasParity("renders", () => {
    return $head;
  });
});
