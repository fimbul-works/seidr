import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $form } from "./form";
import { $input } from "./input";

describeDualMode("Form Element Parity", () => {
  mockUseScope();

  itHasParity("renders with various attributes", () => {
    return $form(
      {
        action: "/submit",
        method: "post",
        enctype: "multipart/form-data",
        target: "_blank",
        novalidate: true,
        autocomplete: "on",
      },
      [$input({ type: "submit", value: "Submit" })],
    );
  });
});
