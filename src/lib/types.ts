export type Post = {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: string[];
  image: string;
  published: boolean;
};

export type Project = {
  title: string;
  slug: string;
  description: string;
  date: string;
  image: string;
  /** Longer writeup shown in the opened project card. */
  details?: string;
  sourceUrl?: string;
  tags?: string[];
  /** Extra pictures shown in the project details, after the cover. */
  images?: string[];
  published: boolean;
};
