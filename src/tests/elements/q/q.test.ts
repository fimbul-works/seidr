import { $q } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Quote Element Parity", () => {
  itHasParity("renders with cite", () => {
    return $q({ cite: "https://example.com" }, ["A short quote"]);
  });
});
