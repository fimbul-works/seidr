import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $span } from "./span";

describeDualMode("Span Element Parity", () => {
  mockUseScope();

  itHasParity("renders correctly", () => {
    return $span({ id: "s1" }, ["Span"]);
  });
});
