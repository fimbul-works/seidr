import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

import type { BlogPost } from "./types.js";

function getContentDir(pathModule: any) {
  return pathModule.resolve(
    typeof __dirname !== "undefined"
      ? pathModule.join(__dirname, "blog-content")
      : pathModule.join(pathModule.dirname(new URL(import.meta.url).pathname), "blog-content"),
  );
}

export async function getPosts(): Promise<BlogPost[]> {
  const contentDir = getContentDir(path);
  const files = await fs.readdir(contentDir);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const md = await fs.readFile(path.join(contentDir, file), "utf-8");
        const { data, content } = matter(md);
        const slug = file.replace(".md", "");
        const firstSentence = content.split(". ").shift() ?? content;
        const excerpt = await marked.parse(`${firstSentence}...`);
        
        return {
          slug,
          title: data.title,
          date: String(data.date),
          excerpt: String(excerpt),
          content: "",
        };
      }),
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const contentDir = getContentDir(path);
    const filePath = path.join(contentDir, `${slug}.md`);
    const md = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(md);
    const parsedContent = await marked.parse(content);

    return {
      slug,
      title: data.title,
      date: String(data.date),
      content: String(parsedContent),
    };
  } catch {
    return null;
  }
}
