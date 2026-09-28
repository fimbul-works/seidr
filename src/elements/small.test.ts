import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $small } from "./small";

describeDualMode("Small Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $small({}, ["Small text"]);
  });
});
