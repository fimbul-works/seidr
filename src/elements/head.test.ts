import { $head } from "./head";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";

describeDualMode("Head Element Parity", () => {
  itHasParity("renders", () => {
    return $head;
  });
});
