import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $button } from "./button";

describeDualMode("Button Element Parity", () => {
  mockUseScope();

  itHasParity("renders with type and name", () => {
    return $button({ type: "submit", name: "send" }, ["Submit"]);
  });

  itHasParity("renders as disabled", () => {
    return $button({ disabled: true }, ["Disabled"]);
  });

  itHasParity("renders with form attributes", () => {
    return $button(
      {
        formAction: "/submit",
        formMethod: "post",
        formNoValidate: true,
        formTarget: "_blank",
      },
      ["Form Button"],
    );
  });

  itHasParity("renders with global attributes", () => {
    return $button({ id: "btn-1", className: "primary" }, ["Button"]);
  });
});
