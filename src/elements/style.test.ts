import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $style } from "./style";

describeDualMode("Style Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $style({ media: "print" }, ["body { color: black; }"]);
  });
});
