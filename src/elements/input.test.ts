import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $input } from "./input";

describeDualMode("Input Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with type and value", () => {
    return $input({ type: "text", value: "Input value" });
  });
});
