import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $head } from "./head";

describeDualMode("Head Element Parity", () => {
  mockUseScope();

  itHasParity("renders", () => {
    return $head;
  });
});
