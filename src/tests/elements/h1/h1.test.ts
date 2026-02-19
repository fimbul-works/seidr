import { $h1 } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("H1 Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $h1({}, ["Heading 1"]);
  });
});
