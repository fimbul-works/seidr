import {
  $article,
  $div,
  $h1,
  $h2,
  $li,
  $p,
  $ul,
  inClient,
  inServer,
  isClient,
  Link,
  List,
  Seidr,
  Suspense,
  Switch,
  useParams,
} from "../../src/index.core.js";
import type { BlogPost } from "./types.js";

const PostCard = (post: BlogPost) =>
  $li({ className: "post-card" }, [
    $h2({}, [Link({ to: `/post/${post.slug}`, textContent: post.title })]),
    $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
    $p({ className: "excerpt", innerHTML: post.excerpt }),
    Link({ to: `/post/${post.slug}`, className: "read-more", textContent: "Read more →" }),
  ]);

export const HomePage = () => {
  let postsPromise: Promise<BlogPost[]>;
  const posts = new Seidr<BlogPost[]>([]);
  const loadTime = new Seidr<number>(0);

  if (import.meta.env.SSR) {
    // Server-side fetch (direct DB access)
    postsPromise = inServer(async () => {
      const postsApi = await import("./blog-api.js");
      posts.value = await postsApi.getPosts();
      loadTime.value = Date.now();
      return posts.value;
    });
  } else if (isClient()) {
    // Client-side fetch if empty or stale
    postsPromise = inClient(async () => {
      if (posts?.value?.length > 0 && Date.now() - loadTime.value < 60000) {
        return posts.value;
      } else {
        const res = await fetch("/api/posts");
        const data = await res.json();
        posts.value = data;
        loadTime.value = Date.now();
        return posts.value;
      }
    });
  }

  return Suspense(postsPromise!, ({ state, value, error }) => {
    return Switch(state, {
      pending: () => $div({ textContent: "Loading posts..." }),
      resolved: () =>
        $div({ className: "home-page" }, [
          $h1({ textContent: "Latest Posts" }),
          $ul({ className: "post-list" }, [List(value as Seidr<BlogPost[]>, (p) => p.slug, PostCard)]),
        ]),
      error: () => $div({ textContent: error.value?.message || "Error" }),
    });
  });
};

export const PostPage = () => {
  const params = useParams();
  const slug = params.value.slug;
  const post = new Seidr<BlogPost | null>(null);
  let postPromise: Promise<BlogPost | null>;

  if (import.meta.env.SSR) {
    postPromise = inServer(async () => {
      const postsApi = await import("./blog-api.js");
      post.value = await postsApi.getPost(slug);
      return post.value;
    });
  } else {
    postPromise = inClient(async () => {
      if (post.value?.slug === slug) {
        return post.value;
      }
      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        post.value = await res.json();
      }
      return post.value;
    });
  }

  return Suspense(postPromise, ({ state, value, error }) => {
    return Switch(state, {
      pending: () => $div({ textContent: "Loading post..." }),
      resolved: () => {
        const p = value.value;
        if (!p) return $div({ textContent: "Post not found" });

        return $article({ className: "post-page" }, [
          $h1({ textContent: p.title }),
          $div({ className: "meta", textContent: new Date(p.date).toLocaleDateString() }),
          $div({ className: "markdown-body", innerHTML: p.content }),
        ]);
      },
      error: () => $div({ textContent: error.value?.message || "Error" }),
    });
  });
};
