import { $dd } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Description Definition Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $dd({ id: "def-1" }, ["A red fruit"]);
  });
});
