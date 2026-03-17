import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $bdo } from "./bdo";

describeDualMode("BiDirectional Overload Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with dir attribute", () => {
    return $bdo({ dir: "rtl" }, ["Override text"]);
  });
});
