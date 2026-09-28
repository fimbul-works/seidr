import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $search } from "./search";

describeDualMode("Search Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $search({ id: "search-area" }, ["Search content"]);
  });
});
