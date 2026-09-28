import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $td } from "./td";

describeDualMode("Table Data Element Parity", () => {
  itHasParity("renders with rowspan and colspan", () => {
    return $td({ rowSpan: 2, colSpan: 3 }, ["Merged cell"]);
  });
});
