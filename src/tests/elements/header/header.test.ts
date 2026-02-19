import { $header } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Header Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $header({ id: "top" }, ["Header content"]);
  });
});
