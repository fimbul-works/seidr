import { $output } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Output Element Parity", () => {
  itHasParity("renders with for and form", () => {
    // Note: form attribute handling verified in assign-prop.ts fix
    return $output({ for: "a b", form: "f1", name: "res" } as any, ["Result"]);
  });
});
