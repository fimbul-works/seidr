import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $ins } from "./ins";

describeDualMode("Inserted Text Element Parity", () => {
  itHasParity("renders with cite and datetime", () => {
    return $ins({ cite: "/edit", dateTime: "2026-02-19" }, ["Inserted"]);
  });
});
