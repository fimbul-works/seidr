import { $bdi } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("BiDirectional Isolation Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $bdi({ dir: "rtl" }, ["Arabic text"]);
  });
});
