import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $input } from "./input";

describeDualMode("Input Element Parity", () => {
  mockUseScope();

  itHasParity("renders with type and value", () => {
    return $input({ type: "text", value: "Input value" });
  });
});
