import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $h2 } from "./h2";

describeDualMode("H2 Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $h2({}, ["Heading 2"]);
  });
});
