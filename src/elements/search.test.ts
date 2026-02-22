import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $search } from "./search";

describeDualMode("Search Element Parity", () => {
  mockUseScope();

  itHasParity("renders with global attributes", () => {
    return $search({ id: "search-area" }, ["Search content"]);
  });
});
