import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $data } from "./data";

describeDualMode("Data Element Parity", () => {
  itHasParity("renders with value", () => {
    return $data({ value: "21053" }, ["Cherry Tomato"]);
  });
});
