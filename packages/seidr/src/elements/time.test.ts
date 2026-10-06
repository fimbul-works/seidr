import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $time } from "./time";

describeDualMode("Time Element Parity", () => {
  itHasParity("renders with datetime", () => {
    return $time({ dateTime: "2026-02-19" }, ["Today"]);
  });
});
