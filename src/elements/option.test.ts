import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $option } from "./option";

describeDualMode("Option Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with various states", () => {
    return $option({ value: "v2", selected: true }, ["Option 2"]);
  });
});
