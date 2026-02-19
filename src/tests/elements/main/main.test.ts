import { $main } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Main Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $main({ id: "content" }, ["Main content"]);
  });
});
