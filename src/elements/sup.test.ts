import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $sup } from "./sup";

describeDualMode("Superscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $sup({}, ["2"]);
  });
});
