import {
  createComponent,
  isServer,
  List,
  Suspense,
  Switch,
  type Value,
  createValue,
  inServer,
  inClient,
} from "@fimbul-works/seidr";
import { $div, $h1, $h2, $li, $ul } from "@fimbul-works/seidr/html";
import { Link } from "@fimbul-works/seidr/router";
import { getPosts } from "../blog-api.js";
import type { BlogPost } from "../types.js";

/**
 * Single post card in a list.
 */
const PostCard = createComponent((post: Value<BlogPost>) => {
  const to = post.as((p) => `/post/${p.slug}`);
  return $li({ className: "post-card" }, [
    Link({ to }, [$h2({ textContent: post.as((p) => p.title) })]),
    $div(
      { className: "meta" },
      post.as((p) => new Date(p.date).toLocaleDateString()),
    ),
    $div({ className: "excerpt", innerHTML: post.as((p) => p.excerpt ?? "") }),
    Link({ to, className: "read-more" }, "Read more →"),
  ]);
}, "PostCard");

/**
 * Home page component.
 */
export const HomePage = createComponent(() => {
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
              $h1({}, "Latest Posts"),
              $ul({ className: "post-list" }, [List(value as Value<BlogPost[]>, (p) => p.slug, PostCard)]),
            ]),
          "ResolvedPosts",
        ),
        pending: createComponent(() => $div({}, "Loading posts..."), "PendingPosts"),
        error: createComponent(
          () => $div({ className: "error" }, error()?.message || "Something went wrong."),
          "ErrorPosts",
        ),
      });
    }, "PostsSuspense"),
  );
}, "HomePage");
