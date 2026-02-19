import { $meter } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Meter Element Parity", () => {
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
