import { createComponent } from "@fimbul-works/seidr";
import { $h2, $li, $nav, $ul } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr-router";
import { componentShowcases } from "../component-showcases";

export const Navigation = createComponent(() => {
  return $nav({ className: "navigation" }, [
    $h2("Components"),
    $ul(componentShowcases.map((showcase) => $li(Link({ href: `/components/${showcase.id}`, ariaCurrent: 'page' }, showcase.title)))),
  ]);
});
