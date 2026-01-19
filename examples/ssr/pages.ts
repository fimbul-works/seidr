import {
  $article,
  $div,
  $h1,
  $h2,
  $li,
  $p,
  $ul,
  Conditional,
  createStateKey,
  hasState,
  Link,
  List,
  Seidr,
  Suspense,
  Switch,
  useScope,
  useState,
} from "../../src/core/index.js";
import { inBrowser, inServer, isBrowser, isServer } from "../../src/ssr/env.js";
import { getPost, getPosts } from "./data.js";
import { getSetCurrentPost, getSetPosts } from "./state.js";
import type { BlogPost } from "./types.js";

const PostCard = (post: BlogPost) =>
  $li({ className: "post-card" }, [
    $h2({}, [Link({ to: `/post/${post.slug}`, textContent: post.title })]),
    $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
    $p({ className: "excerpt", textContent: post.excerpt }),
    Link({ to: `/post/${post.slug}`, className: "read-more", textContent: "Read more →" }),
  ]);

export const HomePage = () => {
  const scope = useScope();
  // let posts: Seidr<BlogPost[]> = getSetPosts()!;
  let postsPromise: Promise<Seidr<BlogPost[]>>;

  let [posts, setPosts] = useState<BlogPost[]>("posts");
  console.log("homepage render", posts);

  if (isServer()) {
    // Server-side fetch (direct DB access)
    console.log("on server");
    postsPromise = inServer(async () => {
      setPosts(await getPosts());
      return posts;
    });
    scope.waitFor(postsPromise);
  } else {
    // Client-side fetch if empty
    console.log("in browser", hasState(createStateKey("posts"))); // This is false, despite hydration data having it!
    postsPromise = inBrowser(async () => {
      console.log("browser got", posts?.value);
      if (posts?.value.length > 0) {
        return posts;
      } else {
        const res = await fetch("/api/posts");
        posts = setPosts(await res.json());
        return postsPromise;
      }
    });
  }

  return Suspense(postsPromise, (posts) => {
    console.log("suspense resolved", posts);
    return $div({ className: "home-page" }, [
      $h1({ textContent: "Latest Posts" }),
      $ul({ className: "post-list" }, [List(posts, (p) => p.slug, PostCard)]),
    ]);
  });
};

export const PostPage = (params: Seidr<{ slug: string }>) => {
  const post: Seidr<BlogPost> = getSetCurrentPost()!;
  let postPromise: Promise<Seidr<BlogPost>>;

  return $div({ textContent: "TODO" });
  const slug = params.as((p) => p.slug);
  const loading = new Seidr(false);
  const error = new Seidr<string | null>(null);

  function fetchPost(s: string) {
    const current = currentPostState.value;
    // If we have the post in state and it matches, use it immediately
    if (current?.slug === s) {
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
        currentPostState.value = await res.json();
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
        currentPostState.value = data;
        loading.value = false;
      } catch (err: any) {
        error.value = err.message;
        loading.value = false;
      }
    });
  }

  slug.observe(fetchPost);

  // Compute view state
  const viewState = Seidr.computed(() => {
    if (loading.value) return "loading";
    if (error.value) return "error";
    if (!currentPostState.value) return "not-found";
    return "content";
  }, [loading, error, currentPostState]);

  return $article({ className: "post-page" }, [
    Switch(viewState, {
      loading: () => $div({ textContent: "Loading..." }),
      error: () => $div({ textContent: `Error: ${error.value}` }),
      "not-found": () => $div({ textContent: "Post not found" }),
      content: () => {
        const post = currentPostState.value!;
        return $div({}, [
          $h1({ textContent: post.title }),
          $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
          DangerousHTML(post.content),
        ]);
      },
    }),
  ]);
};
