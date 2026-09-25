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
        const {
          data: { title, date, tags },
          content,
        } = matter(md);

        const slug = file.replace(".md", "");
        const trimmedContent = content.trim();

        // Find a suitable place to stop
        let pos = trimmedContent.indexOf(".");
        if (pos === -1) pos = trimmedContent.length;

        let selection = trimmedContent.slice(0, pos + 1).trim() ?? trimmedContent;
        if (selection.endsWith(".") && !selection.endsWith("...")) selection += "..";
        const excerpt = await marked.parse(selection.trim());

        return {
          slug,
          title,
          date,
          tags: Array.isArray(tags) ? tags : [tags],
          excerpt: excerpt,
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
    const {
      data: { title, date, tags },
      content,
    } = matter(md);
    const parsedContent = await marked.parse(content.trim());

    return {
      slug,
      title,
      date,
      tags: Array.isArray(tags) ? tags : [tags],
      content: parsedContent,
    };
  } catch {
    return null;
  }
}
