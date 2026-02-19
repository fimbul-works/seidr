import { $small } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Small Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $small({}, ["Small text"]);
  });
});
