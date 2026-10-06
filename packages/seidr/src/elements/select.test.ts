import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $option } from "./option";
import { $select } from "./select";

describeDualMode("Select Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $select(
      {
        name: "options",
        size: 5,
        multiple: true,
        required: true,
        autocomplete: "off",
      },
      [$option({ value: "1" }, ["1"])],
    );
  });
});
