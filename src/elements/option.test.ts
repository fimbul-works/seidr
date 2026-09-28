import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $option } from "./option";

describeDualMode("Option Element Parity", () => {
  itHasParity("renders with various states", () => {
    return $option({ value: "v2", selected: true }, ["Option 2"]);
  });
});
