import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $main } from "./main";

describeDualMode("Main Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $main({ id: "content" }, ["Main content"]);
  });
});
