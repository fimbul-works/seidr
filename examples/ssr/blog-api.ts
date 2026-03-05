import fs from "node:fs/promises";
import path from "node:path";
import fm from "front-matter";
import MarkdownIt from "markdown-it";
import type { BlogPost } from "./types";

const CONTENT_DIR = path.resolve("examples/ssr/blog-content");

interface FrontMatter {
  title: string;
  date: string;
}

const markdown = new MarkdownIt();

export async function getPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const md = await fs.readFile(path.join(CONTENT_DIR, file), "utf-8");
        const { attributes, body } = fm<FrontMatter>(md);
        const slug = file.replace(".md", "");
        const excerpt = markdown.render(`${body.split(". ").shift()!}...`);
        return {
          slug,
          title: attributes.title,
          date: attributes.date,
          excerpt,
          content: "",
        };
      }),
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const md = await fs.readFile(filePath, "utf-8");
  const { attributes, body } = fm<FrontMatter>(md);
  const content = markdown.render(body);

  return {
    slug,
    title: attributes.title,
    date: attributes.date,
    content,
  };
}
