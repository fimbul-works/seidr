import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $h3 } from "./h3";

describeDualMode("H3 Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $h3({}, ["Heading 3"]);
  });
});
