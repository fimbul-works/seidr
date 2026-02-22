import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $dd } from "./dd";
import { $dl } from "./dl";
import { $dt } from "./dt";

describeDualMode("Description List Element Parity", () => {
  mockUseScope();

  itHasParity("renders complete structure", () => {
    return $dl({}, [$dt({}, ["Term"]), $dd({}, ["Definition"])]);
  });
});
