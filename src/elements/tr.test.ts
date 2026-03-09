import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $td } from "./td";
import { $tr } from "./tr";

describeDualMode("Table Row Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with cells", () => {
    return $tr({}, [$td({}, ["Cell 1"]), $td({}, ["Cell 2"])]);
  });
});
