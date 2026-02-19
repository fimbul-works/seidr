import { $search } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Search Element Parity", () => {
  itHasParity("renders with global attributes", () => {
    return $search({ id: "search-area" }, ["Search content"]);
  });
});
