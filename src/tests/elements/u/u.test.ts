import { $u } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Underline Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $u({}, ["Underlined text"]);
  });
});
