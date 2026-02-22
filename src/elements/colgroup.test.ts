import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $col } from "./col";
import { $colgroup } from "./colgroup";

describeDualMode("Column Grouping Elements Parity", () => {
  mockUseScope();

  itHasParity("renders colgroup with span", () => {
    return $colgroup({ span: 3 });
  });

  itHasParity("renders colgroup with children", () => {
    return $colgroup({}, [$col({ span: 1 }), $col({ span: 2 })]);
  });
});
