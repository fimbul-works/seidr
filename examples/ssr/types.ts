export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: string;
  tags?: string[];
  excerpt?: string;
}
