import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $article } from "./article";

describeDualMode("Article Element Parity", () => {
  mockUseScope();

  itHasParity("renders with class and tabindex", () => {
    return $article({ className: "main-article", tabIndex: 0 }, ["Article content"]);
  });

  itHasParity("renders with aria-role", () => {
    return $article({ "aria-role": "article" }, ["Role test"]);
  });

  itHasParity("renders with global attributes", () => {
    return $article({ id: "article-1" }, ["Global attribute test"]);
  });
});
