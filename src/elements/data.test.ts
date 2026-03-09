import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $data } from "./data";

describeDualMode("Data Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with value", () => {
    return $data({ value: "21053" }, ["Cherry Tomato"]);
  });
});
