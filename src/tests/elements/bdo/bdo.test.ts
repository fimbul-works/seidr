import { $bdo } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("BiDirectional Overload Element Parity", () => {
  itHasParity("renders with dir attribute", () => {
    return $bdo({ dir: "rtl" }, ["Override text"]);
  });
});
