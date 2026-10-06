import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $del } from "./del";

describeDualMode("Deleted Text Element Parity", () => {
  itHasParity("renders with cite and datetime", () => {
    return $del({ cite: "/edit", dateTime: "2026-02-19" }, ["Deleted text"]);
  });
});
