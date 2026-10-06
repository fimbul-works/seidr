import {
  createComponent,
  createValue,
  inClient,
  inServer,
  interceptLinks,
  isServer,
  Link,
  List,
  onMounted,
  onUnmounted,
  Show,
  Suspense,
  type SuspenseState,
  Switch,
  useRef,
  useRouteParams,
  type Value,
} from "@fimbul-works/seidr";
import { $article, $div, $h1, $span } from "@fimbul-works/seidr/html";
import { getPost } from "../blog-api.js";
import { DateView } from "../components/date.js";
import { LoadingSpinner } from "../components/loading-spinner.js";
import type { BlogPost } from "../types.js";

const PostNotFound = createComponent(() => {
  return $div({ className: "error not-found-card" }, [
    $h1({ className: "error-title" }, "Post Not Found"),
    $div({ className: "error-message" }, "The requested post does not exist or has been relocated."),
    Link({ to: "/", className: "btn btn-primary", activeClass: "active" }, "← Return to Articles"),
  ]);
}, "PostNotFound");

export const PostContainer = createComponent((post: Value<BlogPost | null>) => {
  return Show(
    post.as((post) => !!post),
    createComponent(() => {
      const markdownBodyRef = useRef<HTMLDivElement>();
      const tags = post.as((post) => post!.tags ?? ["Article"]);

      onMounted(() => interceptLinks(markdownBodyRef()!));

      return $article({ className: "post-page" }, [
        $div({ className: "meta" }, [
          Link({ to: "/", className: "back-link", activeClass: "active" }, [
            $span({ className: "long" }, "← Back to Articles"),
            $span({ className: "short" }, "← Back"),
          ]),
          $div(
            { className: "tags" },
            List(
              tags,
              (tag) => tag,
              (tag) => $span({ className: "meta-badge", textContent: tag }),
            ),
          ),
        ]),
        $h1(
          { className: "article-title" },
          post.as((post) => post!.title),
        ),
        $div({ className: "markdown-body", ref: markdownBodyRef, innerHTML: post.as((post) => post!.content ?? "") }),
        DateView(post()!.date),
      ]);
    }, "PostView"),
    PostNotFound,
  );
}, "PostContainer");

export const PostError = createComponent(
  (error: Value<Error | null>) =>
    $div({ className: "error" }, [$h1("Oops!"), error()?.message || "Something went wrong."]),
  "PostError",
);

/**
 * Single blog post page component.
 */
export const PostPage = createComponent(() => {
  const params = useRouteParams();
  const post = createValue<BlogPost | null>(null, { id: "post" });
  const slug = params.as((p) => p.slug);

  const postPromise = isServer()
    ? slug.as<Promise<BlogPost | null>>((slug) =>
        inServer(async () => {
          if (!slug) return null;
          const data = await getPost(slug);
          post(data);
          return data;
        }),
      )
    : slug.as<Promise<BlogPost | null>>((slug) =>
        inClient(async () => {
          if (post()?.slug === slug) {
            return post();
          }
          if (!slug) return null;
          const res = await fetch(`/api/post/${slug}`);
          if (res.ok) {
            const data = await res.json();
            post(data);
            return data;
          }
          return null;
        }),
      );

  // Clean up derived signal on unmount
  onUnmounted(postPromise.destroy);

  return Suspense(
    postPromise,
    createComponent(({ state, value, error }: SuspenseState<BlogPost | null>) => {
      return Switch(state, {
        resolved: () => PostContainer(value),
        pending: () => LoadingSpinner(),
        error: () => PostError(error),
      });
    }, "PostSuspense"),
  );
}, "PostPage");
