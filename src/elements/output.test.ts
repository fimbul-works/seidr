import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $output } from "./output";

describeDualMode("Output Element Parity", () => {
  mockUseScope();

  itHasParity("renders with htmlFor and form", () => {
    return $output({ htmlFor: "a b", form: "f1", name: "res" } as any, ["Result"]);
  });
});
