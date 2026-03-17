import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $div } from "./div";

describeDualMode("Division Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with nested children", () => {
    return $div({ id: "container", className: "layout" }, [
      $div({ className: "header" }, ["Header"]),
      $div({ className: "content" }, ["Body"]),
    ]);
  });
});
