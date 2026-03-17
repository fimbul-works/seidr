import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $option } from "./option";

describeDualMode("Option Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with various states", () => {
    return $option({ value: "v2", selected: true }, ["Option 2"]);
  });
});
