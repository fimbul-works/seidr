import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $bdo } from "./bdo";

describeDualMode("BiDirectional Overload Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with dir attribute", () => {
    return $bdo({ dir: "rtl" }, ["Override text"]);
  });
});
