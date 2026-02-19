import { $slot } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Slot Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $slot({ name: "my-slot" });
  });
});
