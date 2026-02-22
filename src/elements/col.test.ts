import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $col } from "./col";

describeDualMode("Column Elements Parity", () => {
  mockUseScope();

  itHasParity("renders col with span", () => {
    return $col({ span: 2 });
  });
});
