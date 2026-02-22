import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $footer } from "./footer";

describeDualMode("Footer Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $footer({ id: "page-footer" }, ["Footer content"]);
  });
});
