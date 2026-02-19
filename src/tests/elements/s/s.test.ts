import { $s } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Strikethrough Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $s({}, ["Strike"]);
  });
});
