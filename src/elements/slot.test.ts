import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $slot } from "./slot";

describeDualMode("Slot Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $slot({ name: "my-slot" });
  });
});
