import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $header } from "./header";

describeDualMode("Header Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $header({ id: "top" }, ["Header content"]);
  });
});
