import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $bdi } from "./bdi";

describeDualMode("BiDirectional Isolation Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $bdi({ dir: "rtl" }, ["Arabic text"]);
  });
});
