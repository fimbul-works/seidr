import { $footer } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Footer Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $footer({ id: "page-footer" }, ["Footer content"]);
  });
});
