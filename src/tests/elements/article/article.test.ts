import { $article } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Article Element Parity", () => {
  itHasParity("renders with class and tabindex", () => {
    return $article({ className: "main-article", tabIndex: 0 }, ["Article content"]);
  });

  itHasParity("renders with aria-role", () => {
    // Note: spec mentions aria-role, but standard is 'role'.
    // We test whatever is in the props.
    return $article({ "aria-role": "article" as any }, ["Role test"]);
  });

  itHasParity("renders with global attributes", () => {
    return $article({ id: "article-1" }, ["Global attribute test"]);
  });
});
