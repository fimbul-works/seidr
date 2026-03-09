import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $input } from "./input";

describeDualMode("Input Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with type and value", () => {
    return $input({ type: "text", value: "Input value" });
  });
});
