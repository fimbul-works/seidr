import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $div } from "./div";
import { $template } from "./template";

describeDualMode("Template Element Parity", () => {
  itHasParity("renders content", () => {
    return $template({}, [$div({ className: "content" }, ["Template content"])]);
  });
});
