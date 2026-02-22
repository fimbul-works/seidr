import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $sup } from "./sup";

describeDualMode("Superscript Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $sup({}, ["2"]);
  });
});
