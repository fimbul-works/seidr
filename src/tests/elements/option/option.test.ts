import { $option } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Option Element Parity", () => {
  itHasParity("renders with various states", () => {
    return $option({ value: "v2", selected: true as any }, ["Option 2"]);
  });
});
