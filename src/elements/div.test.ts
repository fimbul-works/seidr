import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $div } from "./div";

describeDualMode("Division Element Parity", () => {
  mockUseScope();

  itHasParity("renders with nested children", () => {
    return $div({ id: "container", className: "layout" }, [
      $div({ className: "header" }, ["Header"]),
      $div({ className: "content" }, ["Body"]),
    ]);
  });
});
