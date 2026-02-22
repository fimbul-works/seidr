import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $style } from "./style";

describeDualMode("Style Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $style({ media: "print" }, ["body { color: black; }"]);
  });
});
