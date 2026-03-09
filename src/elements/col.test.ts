import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $col } from "./col";

describeDualMode("Column Elements Parity", () => {
  mockComponentScope();

  itHasParity("renders col with span", () => {
    return $col({ span: 2 });
  });
});
