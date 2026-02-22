import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $li } from "./li";
import { $ol } from "./ol";

describeDualMode("Ordered List Element Parity", () => {
  mockUseScope();

  itHasParity("renders with reversed and start", () => {
    return $ol({ reversed: true, start: 10 }, [$li({ id: "item-10" }, ["Item 10"]), $li({ id: "item-9" }, ["Item 9"])]);
  });
});
