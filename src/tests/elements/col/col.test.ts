import { $col, $colgroup } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Column Grouping Elements Parity", () => {
  itHasParity("renders col with span", () => {
    return $col({ span: 2 });
  });

  itHasParity("renders colgroup with span", () => {
    return $colgroup({ span: 3 });
  });

  itHasParity("renders colgroup with children", () => {
    return $colgroup({}, [$col({ span: 1 }), $col({ span: 2 })]);
  });
});
