import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $body } from "./body";

describeDualMode("Body Element Parity", () => {
  mockComponentScope();

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
