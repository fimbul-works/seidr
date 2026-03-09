import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $main } from "./main";

describeDualMode("Main Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $main({ id: "content" }, ["Main content"]);
  });
});
