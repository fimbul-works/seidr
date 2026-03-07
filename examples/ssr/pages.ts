import {
  $article,
  $div,
  $h1,
  $h2,
  $li,
  $p,
  $ul,
  component,
  inClient,
  inServer,
  isClient,
  isServer,
  Link,
  List,
  Seidr,
  Suspense,
  Switch,
  useParams,
} from "../../src/index.core.js";
import type { BlogPost } from "./types.js";

const PostCard = component(
  (post: BlogPost) =>
    $li({ className: "post-card" }, [
      $h2({}, [Link({ to: `/post/${post.slug}` }, post.title)]),
      $div({ className: "meta" }, new Date(post.date).toLocaleDateString()),
      $div({ className: "excerpt", innerHTML: post.excerpt }),
      Link({ to: `/post/${post.slug}`, className: "read-more" }, "Read more →"),
    ]),
  "PostCard",
);

export const HomePage = component(() => {
  let postsPromise: Promise<BlogPost[]>;
  const posts = new Seidr<BlogPost[]>([]);
  const loadTime = new Seidr<number>(0);

  if (isServer()) {
    // Server-side fetch (direct DB access)
    postsPromise = inServer(async () => {
      const postsApi = await import("./blog-api.js");
      posts.value = await postsApi.getPosts();
      loadTime.value = Date.now();
      return posts.value;
    });
  } else if (isClient()) {
    // Client-side fetch if empty or stale
    if (posts?.value?.length > 0 && Date.now() - loadTime.value < 60000) {
      postsPromise = posts.value as any;
    } else {
      postsPromise = inClient(async () => {
        const res = await fetch("/api/post");
        const data = await res.json();
        posts.value = data;
        loadTime.value = Date.now();
        return posts.value;
      });
    }
  }

  return Suspense(postsPromise!, ({ state, value, error }) => {
    return Switch(state, {
      pending: () => $div({}, "Loading posts..."),
      resolved: () =>
        $div({ className: "home-page" }, [
          $h1({}, "Latest Posts"),
          $ul({ className: "post-list" }, [List(value as Seidr<BlogPost[]>, (p) => p.slug, PostCard)]),
        ]),
      error: () => $div({}, error.value?.message || "Error"),
    });
  });
}, "HomePage");

export const PostPage = component(() => {
  const params = useParams();
  const post = new Seidr<BlogPost | null>(null);
  let postPromise: Promise<BlogPost | null>;

  if (isServer()) {
    postPromise = inServer(async () => {
      const postsApi = await import("./blog-api.js");
      post.value = await postsApi.getPost(params.value.slug);
      return post.value;
    });
  } else {
    postPromise = inClient(async () => {
      if (post.value?.slug === params.value.slug) {
        return post.value;
      }
      const res = await fetch(`/api/post/${params.value.slug}`);
      if (res.ok) {
        post.value = await res.json();
      }
      return post.value;
    });
  }

  return Suspense(postPromise, ({ state, value, error }) => {
    return Switch(state, {
      pending: () => $div({}, "Loading post..."),
      resolved: () => {
        const p = value.value;
        if (!p) return $div({}, "Post not found");

        return $article({ className: "post-page" }, [
          $h1({}, p.title),
          $div({ className: "meta" }, new Date(p.date).toLocaleDateString()),
          $div({ className: "markdown-body", innerHTML: p.content }),
        ]);
      },
      error: () => $div({}, error.value?.message || "Error"),
    });
  });
}, "PostPage");
