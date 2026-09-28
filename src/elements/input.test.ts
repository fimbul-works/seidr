import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $input } from "./input";

describeDualMode("Input Element Parity", () => {
  itHasParity("renders with type and value", () => {
    return $input({ type: "text", value: "Input value" });
  });
});
