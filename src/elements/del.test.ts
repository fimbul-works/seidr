import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $del } from "./del";

describeDualMode("Deleted Text Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with cite and datetime", () => {
    return $del({ cite: "/edit", dateTime: "2026-02-19" }, ["Deleted text"]);
  });
});
