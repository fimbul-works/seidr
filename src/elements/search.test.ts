import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $search } from "./search";

describeDualMode("Search Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with global attributes", () => {
    return $search({ id: "search-area" }, ["Search content"]);
  });
});
