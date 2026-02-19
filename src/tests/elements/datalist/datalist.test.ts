import { $ } from "../../../element/create-element";
import { $datalist } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Data List Element Parity", () => {
  itHasParity("renders with children", () => {
    return $datalist({ id: "colors" }, [
      $("option", { value: "Red" }),
      $("option", { value: "Green" }),
      $("option", { value: "Blue" }),
    ]);
  });
});
