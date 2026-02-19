import { $progress } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Progress Element Parity", () => {
  itHasParity("renders with value and max", () => {
    return $progress({ value: 70, max: 100 }, ["70%"]);
  });
});
