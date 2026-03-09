import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $header } from "./header";

describeDualMode("Header Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $header({ id: "top" }, ["Header content"]);
  });
});
