import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $th } from "./th";

describeDualMode("Table Header Cell Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with scope", () => {
    return $th({ scope: "col" }, ["Column Header"]);
  });
});
