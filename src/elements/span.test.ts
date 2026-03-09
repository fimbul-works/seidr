import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $span } from "./span";

describeDualMode("Span Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $span({ id: "s1" }, ["Span"]);
  });
});
