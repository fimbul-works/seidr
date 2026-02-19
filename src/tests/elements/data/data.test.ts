import { $data } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Data Element Parity", () => {
  itHasParity("renders with value", () => {
    return $data({ value: "21053" }, ["Cherry Tomato"]);
  });
});
