import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $option } from "./option";

describeDualMode("Option Element Parity", () => {
  mockUseScope();

  itHasParity("renders with various states", () => {
    return $option({ value: "v2", selected: true }, ["Option 2"]);
  });
});
