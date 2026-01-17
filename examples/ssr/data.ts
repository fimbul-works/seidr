import type { BlogPost } from "./types.js";

// Mock Data
const posts: BlogPost[] = [
  {
    slug: "hello-world",
    title: "Hello World",
    date: "2026-01-01T00:00:00.000Z",
    content: `<h1>Hello Seidr</h1>
<p>This is the first post in our minimalistic blog. Seidr makes SSR easy!</p>
`,
    excerpt: "The first post.",
  },
  {
    slug: "second-post",
    title: "Second Post",
    date: "2026-01-02T00:00:00.000Z",
    content: "<h1>Second Post</h1><p>Another nice post.</p>",
    excerpt: "Just another post.",
  },
];

export async function getPosts(): Promise<BlogPost[]> {
  return posts;
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  return posts.find((p) => p.slug === slug);
}
