import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $span } from "./span";

describeDualMode("Span Element Parity", () => {
  mockComponentScope();

  itHasParity("renders correctly", () => {
    return $span({ id: "s1" }, ["Span"]);
  });
});
