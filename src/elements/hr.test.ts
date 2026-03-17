import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
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
