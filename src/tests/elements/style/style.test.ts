import { $style } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Style Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $style({ media: "print" }, ["body { color: black; }"]);
  });
});
