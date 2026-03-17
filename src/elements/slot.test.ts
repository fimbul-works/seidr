import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $slot } from "./slot";

describeDualMode("Slot Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $slot({ name: "my-slot" });
  });
});
