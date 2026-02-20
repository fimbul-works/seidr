import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $li } from "./li";
import { $ul } from "./ul";

describeDualMode("List Item Element Parity", () => {
  itHasParity("renders with value and type", () => {
    return $ul({}, [$li({ value: 5, type: "square" }, ["Item"])]);
  });
});
