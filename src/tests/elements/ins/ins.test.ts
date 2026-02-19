import { $ins } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Inserted Text Element Parity", () => {
  itHasParity("renders with cite and datetime", () => {
    return $ins({ cite: "/edit", dateTime: "2026-02-19" }, ["Inserted"]);
  });
});
