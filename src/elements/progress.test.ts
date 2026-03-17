import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $progress } from "./progress";

describeDualMode("Progress Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with value and max", () => {
    return $progress({ value: 70, max: 100 }, ["70%"]);
  });
});
