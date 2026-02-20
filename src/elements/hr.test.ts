import { $hr } from "./hr";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode";

describeDualMode("Horizontal Rule Element Parity", () => {
  itHasParity("renders with attributes", () => {
    return $hr({
      align: "center",
      color: "blue",
      noShade: true,
      size: "2",
      width: "50%",
    });
  });
});
