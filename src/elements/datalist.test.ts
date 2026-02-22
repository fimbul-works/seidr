import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $datalist } from "./datalist";
import { $option } from "./option";

describeDualMode("Data List Element Parity", () => {
  mockUseScope();

  itHasParity("renders with children", () => {
    return $datalist({ id: "colors" }, [
      $option({ value: "Red" }),
      $option({ value: "Green" }),
      $option({ value: "Blue" }),
    ]);
  });
});
