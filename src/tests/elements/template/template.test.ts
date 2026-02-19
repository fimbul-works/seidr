import { $ } from "../../../element/create-element";
import { $template } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Template Element Parity", () => {
  itHasParity("renders content", () => {
    return $template({}, [$("div", { className: "content" }, ["Template content"])]);
  });
});
