import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $col } from "./col";

describeDualMode("Column Elements Parity", () => {
  itHasParity("renders col with span", () => {
    return $col({ span: 2 });
  });
});
