import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $footer } from "./footer";

describeDualMode("Footer Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $footer({ id: "page-footer" }, ["Footer content"]);
  });
});
