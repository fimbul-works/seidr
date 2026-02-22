import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $textarea } from "./textarea";

describeDualMode("Textarea Element Parity", () => {
  mockUseScope();

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
