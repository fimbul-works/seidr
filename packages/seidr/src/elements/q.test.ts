import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $q } from "./q";

describeDualMode("Quote Element Parity", () => {
  itHasParity("renders with cite", () => {
    return $q({ cite: "https://example.com" }, ["A short quote"]);
  });
});
