import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $body } from "./body";

describeDualMode("Body Element Parity", () => {
  itHasParity("renders with legacy attributes", () => {
    return $body(
      {
        bgColor: "white",
        text: "black",
        link: "blue",
        vLink: "purple",
        aLink: "red",
      },
      ["Body content"],
    );
  });
});
