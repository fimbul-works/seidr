import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $sup } from "./sup";

describeDualMode("Superscript Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $sup({}, ["2"]);
  });
});
