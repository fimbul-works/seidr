import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $bdi } from "./bdi";

describeDualMode("BiDirectional Isolation Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $bdi({ dir: "rtl" }, ["Arabic text"]);
  });
});
