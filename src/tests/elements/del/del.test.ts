import { $del } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Deleted Text Element Parity", () => {
  itHasParity("renders with cite and datetime", () => {
    return $del({ cite: "/edit", dateTime: "2026-02-19" }, ["Deleted text"]);
  });
});
