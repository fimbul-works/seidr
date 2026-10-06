import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $head } from "./head";

describeDualMode("Head Element Parity", () => {
  itHasParity("renders", () => {
    return $head;
  });
});
