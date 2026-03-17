import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $main } from "./main";

describeDualMode("Main Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $main({ id: "content" }, ["Main content"]);
  });
});
