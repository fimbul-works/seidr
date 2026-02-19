import { $textarea } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Textarea Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $textarea(
      {
        name: "bio",
        rows: 5,
        cols: 30,
        placeholder: "Enter bio",
        disabled: true,
        readOnly: true,
        required: true,
      },
      ["Initial value"],
    );
  });
});
