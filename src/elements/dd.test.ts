import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $dd } from "./dd";

describeDualMode("Description Definition Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $dd({ id: "def-1" }, ["A red fruit"]);
  });
});
