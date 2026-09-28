import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $title } from "./title";

describeDualMode("Title Element Parity", () => {
  itHasParity("renders with content", () => {
    return $title({}, ["Page Title"]);
  });
});
