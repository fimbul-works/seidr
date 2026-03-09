import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $bdi } from "./bdi";

describeDualMode("BiDirectional Isolation Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $bdi({ dir: "rtl" }, ["Arabic text"]);
  });
});
