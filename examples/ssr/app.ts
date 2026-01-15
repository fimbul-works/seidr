import {
  $a,
  $article,
  $div,
  $footer,
  $h1,
  $h2,
  $li,
  $nav,
  $p,
  $ul,
  Conditional,
  createRoute,
  createStateKey,
  getState,
  initRouter,
  Link,
  List,
  Router,
  Seidr,
  Suspense,
  setState,
} from "../../src/core/index.js";
import { inBrowser } from "../../src/ssr/env.js";
import type { BlogPost } from "./types.js";

// State keys
const postsKey = createStateKey<Seidr<BlogPost[]>>("posts");
const currentPostKey = createStateKey<Seidr<BlogPost | null>>("currentPost");

// Components
const Header = () =>
  $nav({ className: "navbar" }, [
    Link({ to: "/", className: "brand", textContent: "Seidr Blog" }),
    $div({ className: "links" }, [
      Link({ to: "/", textContent: "Home" }),
      $a({ href: "https://github.com/fimbul-works/seidr", target: "_blank", textContent: "GitHub" }),
    ]),
  ]);

const PostCard = (post: BlogPost) =>
  $li({ className: "post-card" }, [
    $h2({}, [Link({ to: `/post/${post.slug}`, textContent: post.title })]),
    $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
    $p({ className: "excerpt", textContent: post.excerpt }),
    Link({ to: `/post/${post.slug}`, className: "read-more", textContent: "Read more →" }),
  ]);

const HomePage = () => {
  const posts = getState(postsKey);

  // Client-side fetch if empty (SPA navigation scenario)
  inBrowser(async () => {
    if (posts.value.length === 0) {
      const res = await fetch("/api/posts");
      posts.value = await res.json();
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

const PostPage = (params?: Seidr<{ slug: string }>) => {
  const currentPost = getState(currentPostKey);
  const slug = params?.as((p) => p.slug);

  const postPromise = new Seidr<Promise<BlogPost | null>>(Promise.resolve(null));

  if (slug) {
    slug.observe((s) => {
      const current = currentPost.value;
      if (current && current.slug === s) {
        postPromise.value = Promise.resolve(current);
      } else {
        const prom = inBrowser(async () => {
          const res = await fetch(`/api/posts/${s}`);
          if (!res.ok) throw new Error("Post not found");
          const data = await res.json();
          currentPost.value = data;
          return data;
        });

        if (prom) {
          postPromise.value = prom;
        } else {
          // SSR or non-browser fallback: use currentPost if matches
          if (currentPost.value && currentPost.value.slug === s) {
            postPromise.value = Promise.resolve(currentPost.value);
          } else {
            // SSR waiting?
            // In real SSR data fetching, we'd pre-load data and pass it.
            // For now, assume resolved if present.
            postPromise.value = Promise.resolve(currentPost.value);
          }
        }
      }
    });
  }

  return $article({ className: "post-page" }, [
    Suspense(
      postPromise,
      (post) => {
        if (!post) return $div({ textContent: "Post not found or loading..." });
        return $div({}, [
          $h1({ textContent: post.title }),
          $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
          DangerousHTML(post.content),
        ]);
      },
      () => $div({ textContent: "Loading..." }),
      (err) => $div({ textContent: `Error: ${err.message}` }),
    ),
  ]);
};

// Main App
export const BlogApp = (props?: { posts?: BlogPost[]; currentPost?: BlogPost | null }) => {
  initRouter();

  const posts = new Seidr<BlogPost[]>([]);
  const currentPost = new Seidr<BlogPost | null>(null);

  if (props) {
    if (props.posts) posts.value = props.posts;
    if (props.currentPost) currentPost.value = props.currentPost;

    setState(postsKey, posts);
    setState(currentPostKey, currentPost);
  } else {
    setState(postsKey, posts);
    setState(currentPostKey, currentPost);
  }

  return $div({ className: "app-container" }, [
    Header(),
    $div({ className: "main-content" }, [
      Router({
        routes: [createRoute("/", HomePage), createRoute("/post/:slug", PostPage)],
        fallback: () => $div({ textContent: "404 Not Found" }),
      }),
    ]),
    $footer({ textContent: `© ${new Date().getFullYear()} Seidr Blog Example` }),
  ]);
};
