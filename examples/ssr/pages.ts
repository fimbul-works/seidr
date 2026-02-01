import {
  $article,
  $div,
  $h1,
  $h2,
  $li,
  $p,
  $ul,
  inBrowser,
  inServer,
  isServer,
  Link,
  List,
  type Seidr,
  Suspense,
  useState,
} from "../../src/index.browser.js";
import { getPost, getPosts } from "./data.js";
import type { BlogPost } from "./types.js";

const PostCard = (post: BlogPost) =>
  $li({ className: "post-card" }, [
    $h2({}, [Link({ to: `/post/${post.slug}`, textContent: post.title })]),
    $div({ className: "meta", textContent: new Date(post.date).toLocaleDateString() }),
    $p({ className: "excerpt", textContent: post.excerpt }),
    Link({ to: `/post/${post.slug}`, className: "read-more", textContent: "Read more →" }),
  ]);

export const HomePage = () => {
  let postsPromise: Promise<Seidr<BlogPost[]>>;
  const [posts, setPosts] = useState<BlogPost[]>("posts");

  if (isServer()) {
    // Server-side fetch (direct DB access)
    postsPromise = inServer(async () => {
      setPosts(await getPosts());
      return posts;
    });
  } else {
    // Client-side fetch if empty
    postsPromise = inBrowser(async () => {
      if (posts?.value?.length > 0) {
        return posts;
      } else {
        const res = await fetch("/api/posts");
        const data = await res.json();
        return setPosts(data);
      }
    });
  }

  return Suspense(postsPromise, (posts) => {
    return $div({ className: "home-page" }, [
      $h1({ textContent: "Latest Posts" }),
      $ul({ className: "post-list" }, [List(posts, (p) => p.slug, PostCard)]),
    ]);
  });
};

export const PostPage = (params: Seidr<{ slug: string }>) => {
  const slug = params.value.slug;
  const [post, setPost] = useState<BlogPost>("currentPost");
  let postPromise: Promise<Seidr<BlogPost>>;

  if (isServer()) {
    postPromise = inServer(async () => {
      const data = await getPost(slug);
      if (data) setPost(data);
      return post;
    });
  } else {
    postPromise = inBrowser(async () => {
      if (post.value?.slug === slug) {
        return post;
      }
      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        setPost(await res.json());
      }
      return post;
    });
  }

  return Suspense(postPromise, (post) => {
    const p = post.value;
    if (!p) return $div({ textContent: "Post not found" });

    return $article({ className: "post-page" }, [
      $h1({ textContent: p.title }),
      $div({ className: "meta", textContent: new Date(p.date).toLocaleDateString() }),
      $div({ className: "markdown-body", innerHTML: p.content }),
    ]);
  });
};
