import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $main } from "./main";

describeDualMode("Main Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $main({ id: "content" }, ["Main content"]);
  });
});
