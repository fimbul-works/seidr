import { $menu } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Menu Element Parity", () => {
  itHasParity("renders with nested items", () => {
    $menu({}, ["Action"]);
  });
});
