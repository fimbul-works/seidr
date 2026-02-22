import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $th } from "./th";

describeDualMode("Table Header Cell Element Parity", () => {
  mockUseScope();

  itHasParity("renders with scope", () => {
    return $th({ scope: "col" }, ["Column Header"]);
  });
});
