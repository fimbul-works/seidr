import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $div } from "./div";
import { $template } from "./template";

describeDualMode("Template Element Parity", () => {
  mockUseScope();

  itHasParity("renders content", () => {
    return $template({}, [$div({ className: "content" }, ["Template content"])]);
  });
});
