import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $bdo } from "./bdo";

describeDualMode("BiDirectional Overload Element Parity", () => {
  mockUseScope();

  itHasParity("renders with dir attribute", () => {
    return $bdo({ dir: "rtl" }, ["Override text"]);
  });
});
