import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $optgroup } from "./optgroup";
import { $option } from "./option";

describeDualMode("Option Group Element Parity", () => {
  mockUseScope();

  itHasParity("renders with children", () => {
    return $optgroup({ label: "Group", disabled: true }, [$option({ value: "1" }, ["Option 1"])]);
  });
});
