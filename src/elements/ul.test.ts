import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $li } from "./li";
import { $ul } from "./ul";

describeDualMode("Unordered List Element Parity", () => {
  mockUseScope();

  itHasParity("renders with children", () => {
    return $ul({}, [$li({}, ["Item 1"]), $li({}, ["Item 2"])]);
  });
});
