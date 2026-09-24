import {
  createComponent,
  createValue,
  inClient,
  inServer,
  isServer,
  Link,
  Suspense,
  type SuspenseState,
  Switch,
  useRouteParams,
} from "@fimbul-works/seidr";
import { $article, $div, $h1, $span } from "@fimbul-works/seidr/html";
import { getPost } from "../blog-api.js";
import { DateView } from "../components/date.js";
import type { BlogPost } from "../types.js";

/**
 * Single blog post page component.
 */
export const PostPage = createComponent(() => {
  const params = useRouteParams();
  const post = createValue<BlogPost | null>(null, { id: "post" });

  const postPromise: Promise<BlogPost | null> = isServer()
    ? inServer(async () => {
        const slug = params().slug;
        const data = await getPost(slug);
        post(data);
        return data;
      })!
    : inClient(async () => {
        const slug = params().slug;
        if (post()?.slug === slug) {
          return post();
        }
        const res = await fetch(`/api/post/${slug}`);
        if (res.ok) {
          const data = await res.json();
          post(data);
          return data;
        }
        return null;
      })!;

  return Suspense(
    postPromise,
    createComponent(({ state, value, error }: SuspenseState<BlogPost | null>) => {
      return Switch(state, {
        resolved: createComponent(() => {
          const post = value();
          if (!post) {
            return $div({ className: "error not-found-card" }, [
              $h1({ className: "error-title" }, "Post Not Found"),
              $div({ className: "error-message" }, "The requested dispatch does not exist or has been relocated."),
              Link({ to: "/", className: "back-link" }, "← Back to Articles"),
            ]);
          }

          return $article({ className: "post-page" }, [
            $div({ className: "meta" }, [$span({ className: "meta-badge", textContent: "Article" })]),
            Link({ to: "/", className: "back-link" }, "← Back to Articles"),
            $h1({ className: "article-title" }, post.title),
            $div({ className: "markdown-body", innerHTML: post.content }),
            DateView(post.date),
          ]);
        }, "ResolvedPost"),
        pending: createComponent(() => $div({ className: "loading-state" }, "Loading..."), "PendingPost"),
        error: createComponent(
          () => $div({ className: "error" }, error()?.message || "Something went wrong."),
          "ErrorPost",
        ),
      });
    }, "PostSuspense"),
  );
}, "PostPage");
