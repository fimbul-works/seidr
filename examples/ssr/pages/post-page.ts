import {
  createComponent,
  createValue,
  inClient,
  inServer,
  isServer,
  Suspense,
  type SuspenseState,
  Switch,
} from "@fimbul-works/seidr";
import { $article, $div, $h1 } from "@fimbul-works/seidr/html";
import { useRouteParams } from "@fimbul-works/seidr/router";
import { getPost } from "../blog-api.js";
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
          const p = value();
          if (!p) {
            return $div({ className: "error" }, "Post not found");
          }

          return $article({ className: "post-page" }, [
            $h1({}, p.title),
            $div({ className: "meta" }, new Date(p.date).toLocaleDateString()),
            $div({ className: "markdown-body", innerHTML: p.content }),
          ]);
        }, "ResolvedPost"),
        pending: createComponent(() => $div({}, "Loading post..."), "PendingPost"),
        error: createComponent(
          () => $div({ className: "error" }, error()?.message || "Something went wrong."),
          "ErrorPost",
        ),
      });
    }, "PostSuspense"),
  );
}, "PostPage");
