import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $td } from "./td";
import { $tr } from "./tr";

describeDualMode("Table Row Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with cells", () => {
    return $tr({}, [$td({}, ["Cell 1"]), $td({}, ["Cell 2"])]);
  });
});
