import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $td } from "./td";

describeDualMode("Table Data Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with rowspan and colspan", () => {
    return $td({ rowSpan: 2, colSpan: 3 }, ["Merged cell"]);
  });
});
