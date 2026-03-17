import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $q } from "./q";

describeDualMode("Quote Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with cite", () => {
    return $q({ cite: "https://example.com" }, ["A short quote"]);
  });
});
