import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $header } from "./header";

describeDualMode("Header Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $header({ id: "top" }, ["Header content"]);
  });
});
