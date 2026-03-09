import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $slot } from "./slot";

describeDualMode("Slot Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $slot({ name: "my-slot" });
  });
});
