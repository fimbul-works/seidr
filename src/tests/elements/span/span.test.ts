import { $span } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Span Element Parity", () => {
  itHasParity("renders correctly", () => {
    return $span({ id: "s1" }, ["Span"]);
  });
});
