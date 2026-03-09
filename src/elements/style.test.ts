import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $style } from "./style";

describeDualMode("Style Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $style({ media: "print" }, ["body { color: black; }"]);
  });
});
