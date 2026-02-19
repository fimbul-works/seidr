import { $title } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Title Element Parity", () => {
  itHasParity("renders with content", () => {
    return $title({}, ["Page Title"]);
  });
});
