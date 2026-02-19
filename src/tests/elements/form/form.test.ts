import { $ } from "../../../element/create-element";
import { $form } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Form Element Parity", () => {
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
      [$("input", { type: "submit", value: "Submit" })],
    );
  });
});
