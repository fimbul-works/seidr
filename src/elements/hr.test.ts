import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $hr } from "./hr";

describeDualMode("Horizontal Rule Element Parity", () => {
  mockUseScope();

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
