import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $col } from "./col";

describeDualMode("Column Elements Parity", () => {
  mockComponentScope();

  itHasParity("renders col with span", () => {
    return $col({ span: 2 });
  });
});
