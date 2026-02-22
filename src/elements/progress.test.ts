import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $progress } from "./progress";

describeDualMode("Progress Element Parity", () => {
  mockUseScope();

  itHasParity("renders with value and max", () => {
    return $progress({ value: 70, max: 100 }, ["70%"]);
  });
});
