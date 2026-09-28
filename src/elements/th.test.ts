import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $th } from "./th";

describeDualMode("Table Header Cell Element Parity", () => {
  itHasParity("renders with scope", () => {
    return $th({ scope: "col" }, ["Column Header"]);
  });
});
