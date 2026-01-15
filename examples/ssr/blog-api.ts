import fs from "node:fs/promises";
import path from "node:path";
import fm from "front-matter";
import { marked } from "marked";
import type { BlogPost } from "./types";

const CONTENT_DIR = path.resolve("examples/ssr/blog-content");

interface FrontMatter {
  title: string;
  date: string;
}

export async function getPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const content = await fs.readFile(path.join(CONTENT_DIR, file), "utf-8");
        const { attributes, body } = fm<FrontMatter>(content);
        const slug = file.replace(".md", "");
        const html = await marked(body);

        return {
          slug,
          title: attributes.title,
          date: attributes.date,
          content: html,
          excerpt: body.substring(0, 150) + "...",
        };
      }),
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    const content = await fs.readFile(filePath, "utf-8");
    const { attributes, body } = fm<FrontMatter>(content);
    const html = await marked(body);

    return {
      slug,
      title: attributes.title,
      date: attributes.date,
      content: html,
    };
  } catch (e) {
    return null;
  }
}
