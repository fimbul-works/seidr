import {
  createComponent,
  createValue,
  inClient,
  inServer,
  isServer,
  Link,
  List,
  random,
  Suspense,
  Switch,
  type Value,
} from "@fimbul-works/seidr";
import { $div, $footer, $h1, $h2, $li, $main, $p, $span, $ul } from "@fimbul-works/seidr/html";
import { getPosts } from "../blog-api.js";
import { DateView } from "../components/date.js";
import type { BlogPost } from "../types.js";

const TAGLINES: readonly [string, string[]][] = [
  [
    "Seiðr, Actually",
    [
      "A love letter to reactive state, written under duress.",
      "Committed to components. Emotionally and otherwise.",
      "It was never virtual. It was always real DOM love.",
      "Some bugs were fixed. Others went away somewhere and now I'm scared.",
      "We were on a break. Then I refactored everything.",
    ],
  ],
  [
    "State of the Art(-ish)",
    [
      "Fine-grained, mostly on purpose.",
      "No virtual DOM. Just vibes and obsession.",
      "Surgical updates. Occasionally overkill.",
      "Pure functions, impure motives.",
      "Cutting-edge, in a kilobyte-conscious way.",
    ],
  ],
  [
    "A Few kB of Your Time",
    [
      "Zero-build. Zero regrets. Occasional exceptions.",
      "We shipped less so you'd wait less.",
      "Every byte fought for its place in this bundle, and lost.",
      "Lean by design. Occasionally lean by accident.",
      "You won't finish reading this before it finishes loading.",
    ],
  ],
] as const;

/**
 * Single post card in a list.
 */
const PostCard = createComponent((post: Value<BlogPost>) => {
  const { slug, excerpt, date, title, tags } = post();
  const to = `/post/${slug}`;

  return $li({ className: "post-card" }, [
    $div(
      { className: "meta" },
      tags
        ? tags.map((tag) => $span({ className: "meta-badge", textContent: tag }))
        : [$span({ className: "meta-badge", textContent: "Article" })],
    ),
    Link({ to, className: "post-card-title-link" }, [$h2({ className: "post-title", textContent: title })]),
    $main({ className: "excerpt", innerHTML: excerpt ?? "" }),
    $footer({ className: "post-card-footer" }, [
      Link({ to, className: "read-more" }, "Read article →"),
      DateView(date),
    ]),
  ]);
}, "PostCard");

/**
 * Home page component.
 */
export const HomePage = createComponent(() => {
  // Default title and tagline
  const title = createValue<string>("Seiðr, Actually", { id: "title" });
  const tagline = createValue<string>("A love letter to reactive state, written under duress.", { id: "tagline" });

  const r1 = Math.floor(random() * Number.MAX_SAFE_INTEGER);
  const r2 = Math.floor(random() * Number.MAX_SAFE_INTEGER);
  const [titleStr, taglines] = TAGLINES[r1 % TAGLINES.length];
  const taglineStr = taglines[r2 % taglines.length];
  title(titleStr);
  tagline(taglineStr);

  const posts = createValue<BlogPost[]>([], { id: "posts" });
  const loadTime = createValue<number>(0, { id: "loadtime" });

  const postsPromise: Promise<BlogPost[]> = isServer()
    ? inServer(async () => {
        const data = await getPosts();
        posts(data);
        loadTime(Date.now());
        return data;
      })!
    : inClient(async () => {
        if (posts().length > 0 && Date.now() - loadTime() < 60000) {
          return posts();
        }
        const res = await fetch("/api/post");
        const data = await res.json();
        posts(data);
        loadTime(Date.now());
        return data;
      })!;

  return Suspense(
    postsPromise,
    createComponent(({ state, value, error }) => {
      return Switch(state, {
        resolved: createComponent(
          () =>
            $div({ className: "home-page" }, [
              $div({ className: "blog-hero" }, [
                $h1({ className: "hero-title" }, title()),
                $p({ className: "hero-subtitle" }, tagline()),
              ]),
              $ul({ className: "post-list" }, [List(value as Value<BlogPost[]>, (p) => p.slug, PostCard)]),
            ]),
          "ResolvedPosts",
        ),
        pending: createComponent(() => $div({ className: "loading-state" }, "Loading dispatches..."), "PendingPosts"),
        error: createComponent(
          () => $div({ className: "error" }, error()?.message || "Something went wrong."),
          "ErrorPosts",
        ),
      });
    }, "PostsSuspense"),
  );
}, "HomePage");
