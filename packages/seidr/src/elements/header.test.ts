import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $header } from "./header";

describeDualMode("Header Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $header({ id: "top" }, ["Header content"]);
  });
});
