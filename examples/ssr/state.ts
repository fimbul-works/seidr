import { createStateKey, type Seidr } from "../../src/core/index.js";
import type { BlogPost } from "./types.js";

// State keys
export const postsKey = createStateKey<Seidr<BlogPost[]>>("posts");
export const currentPostKey = createStateKey<Seidr<BlogPost | null>>("currentPost");
