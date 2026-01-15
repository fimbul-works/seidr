export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: string; // HTML content or simplified
  excerpt?: string;
}
