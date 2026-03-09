import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $hr } from "./hr";

describeDualMode("Horizontal Rule Element Parity", () => {
  mockComponentScope();

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
