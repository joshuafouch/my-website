export type Categories = 'sveltekit' | 'svelte';

export type Post = {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: Categories[];
  image: string;
  published: boolean;
};

export type Project = {
  title: string;
  slug: string;
  description: string;
  date: string;
  image: string;
  sourceUrl?: string;
  tags?: string[];
  published: boolean;
};
