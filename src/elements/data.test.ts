import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $data } from "./data";

describeDualMode("Data Element Parity", () => {
  mockUseScope();

  itHasParity("renders with value", () => {
    return $data({ value: "21053" }, ["Cherry Tomato"]);
  });
});
