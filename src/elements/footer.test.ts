import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $footer } from "./footer";

describeDualMode("Footer Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $footer({ id: "page-footer" }, ["Footer content"]);
  });
});
