import { $body } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

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
