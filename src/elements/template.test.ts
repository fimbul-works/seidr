import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $div } from "./div";
import { $template } from "./template";

describeDualMode("Template Element Parity", () => {
  mockComponentScope();

  itHasParity("renders content", () => {
    return $template({}, [$div({ className: "content" }, ["Template content"])]);
  });
});
