import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $mark } from "./mark";

describeDualMode("Mark Element Parity", () => {
  itHasParity("renders with content", () => {
    return $mark({}, ["Highlighted"]);
  });
});
