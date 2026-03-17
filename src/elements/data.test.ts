import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $data } from "./data";

describeDualMode("Data Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with value", () => {
    return $data({ value: "21053" }, ["Cherry Tomato"]);
  });
});
