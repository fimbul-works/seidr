import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $style } from "./style";

describeDualMode("Style Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $style({ media: "print" }, ["body { color: black; }"]);
  });
});
