import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $slot } from "./slot";

describeDualMode("Slot Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $slot({ name: "my-slot" });
  });
});
