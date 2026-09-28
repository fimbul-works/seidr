import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $sup } from "./sup";

describeDualMode("Superscript Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $sup({}, ["2"]);
  });
});
