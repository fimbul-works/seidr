import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $rt } from "./rt";

describeDualMode("Ruby Text Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $rt({}, ["かん"]);
  });
});
