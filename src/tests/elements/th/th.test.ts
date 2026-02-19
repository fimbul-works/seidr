import { $th } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Table Header Cell Element Parity", () => {
  itHasParity("renders with scope", () => {
    return $th({ scope: "col" }, ["Column Header"]);
  });
});
