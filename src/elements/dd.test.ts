import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $dd } from "./dd";

describeDualMode("Description Definition Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $dd({ id: "def-1" }, ["A red fruit"]);
  });
});
