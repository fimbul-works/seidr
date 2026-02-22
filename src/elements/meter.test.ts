import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $meter } from "./meter";

describeDualMode("Meter Element Parity", () => {
  mockUseScope();

  itHasParity("renders with gauging attributes", () => {
    return $meter(
      {
        value: 0.6,
        min: 0,
        max: 1,
        low: 0.33,
        high: 0.66,
        optimum: 0.8,
      },
      ["60%"],
    );
  });
});
