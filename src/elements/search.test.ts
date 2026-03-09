import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $search } from "./search";

describeDualMode("Search Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $search({ id: "search-area" }, ["Search content"]);
  });
});
