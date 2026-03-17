import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $textarea } from "./textarea";

describeDualMode("Textarea Element Parity", () => {
  mockComponentScope();

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
