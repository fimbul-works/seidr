import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $output } from "./output";

describeDualMode("Output Element Parity", () => {
  itHasParity("renders with for and form", () => {
    return $output({ for: "a b", form: "f1", name: "res" } as any, ["Result"]);
  });
});
