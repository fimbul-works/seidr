import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $output } from "./output";

describeDualMode("Output Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with htmlFor and form", () => {
    return $output({ htmlFor: "a b", form: "f1", name: "res" } as any, ["Result"]);
  });
});
