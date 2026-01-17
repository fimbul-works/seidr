import {
  $article,
  $div,
  $h1,
  $h2,
  $li,
  $p,
  $ul,
  getState,
  hasState,
  Link,
  List,
  Seidr,
  Suspense,
  Switch,
} from "../../src/core/index.js";
import { inBrowser, inServer } from "../../src/ssr/env.js";
import { getPost, getPosts } from "./data.js";
import { currentPostKey, postsKey } from "./state.js";
import type { BlogPost } from "./types.js";

const PostCard = (post: BlogPost) =>
  $li({ className: "post-card" }, [
    $h2({}, [Link({ to: `/post/${post.slug}`, textContent: post.title })]),
    $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
    $p({ className: "excerpt", textContent: post.excerpt }),
    Link({ to: `/post/${post.slug}`, className: "read-more", textContent: "Read more →" }),
  ]);

export const HomePage = () => {
  const posts = getState(postsKey);

  // Client-side fetch if empty
  inBrowser(async () => {
    if (posts.value.length === 0) {
      const res = await fetch("/api/posts");
      posts.value = await res.json();
    }
  });

  // Server-side fetch (direct DB access)
  inServer(async () => {
    if (posts.value.length === 0) {
      posts.value = await getPosts();
    }
  });

  return $div({ className: "home-page" }, [
    $h1({ textContent: "Latest Posts" }),
    $ul({ className: "post-list" }, [List(posts, (p) => p.slug, PostCard)]),
  ]);
};

// Helper to manually create 'unsafe' HTML content
const DangerousHTML = (html: Seidr<string> | string) => {
  const el = $div({ className: "markdown-body" });
  if (html instanceof Seidr) {
    el.innerHTML = html.value;
    html.observe((v) => (el.innerHTML = v));
  } else {
    el.innerHTML = html;
  }
  return el;
};

export const PostPage = (params: Seidr<{ slug: string }>) => {
  const currentPost = getState(currentPostKey);
  const slug = params.as((p) => p.slug);
  const loading = new Seidr(false);
  const error = new Seidr<string | null>(null);

  function fetchPost(s: string) {
    const current = currentPost.value;
    // If we have the post in state and it matches, use it immediately
    if (current && current.slug === s) {
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    // Client-side: Fetch from API
    inBrowser(async () => {
      try {
        const res = await fetch(`/api/posts/${s}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        currentPost.value = data;
        loading.value = false;
      } catch (err: any) {
        error.value = err.message;
        loading.value = false;
      }
    });

    // Server-side: Fetch directly
    inServer(async () => {
      try {
        const data = await getPost(s);
        if (!data) throw new Error("Post not found");
        currentPost.value = data;
        loading.value = false;
      } catch (err: any) {
        error.value = err.message;
        loading.value = false;
      }
    });
  }

  slug.observe(fetchPost);

  // Initial Check
  if (!(hasState(currentPostKey) && currentPost.value && currentPost.value.slug === slug.value)) {
    fetchPost(slug.value);
  }

  // Compute view state
  const viewState = Seidr.computed(() => {
    if (loading.value) return "loading";
    if (error.value) return "error";
    if (!currentPost.value) return "not-found";
    return "content";
  }, [loading, error, currentPost]);

  return $article({ className: "post-page" }, [
    Switch(viewState, {
      loading: () => $div({ textContent: "Loading..." }),
      error: () => $div({ textContent: `Error: ${error.value}` }),
      "not-found": () => $div({ textContent: "Post not found" }),
      content: () => {
        const post = currentPost.value!;
        return $div({}, [
          $h1({ textContent: post.title }),
          $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
          DangerousHTML(post.content),
        ]);
      },
    }),
  ]);
};
