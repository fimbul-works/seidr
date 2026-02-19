import { $optgroup, $option } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Option Group Element Parity", () => {
  itHasParity("renders with children", () => {
    return $optgroup({ label: "Group", disabled: true as any }, [$option({ value: "1" }, ["Option 1"])]);
  });
});
