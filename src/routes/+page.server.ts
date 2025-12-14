import type { Post } from '$lib/types';

export async function load({ fetch }) {
  // Fetch all posts from the API
  const response = await fetch('/api/posts');
  const posts: Post[] = await response.json();

  // If no posts exist, return null
  if (posts.length === 0) {
    return { featuredPost: null };
  }

  // Get the current date and calculate day of year
  // This ensures the same post is shown all day, but changes daily
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use modulo to cycle through posts based on the day of year
  // This creates a deterministic "random" selection that changes daily
  const featuredIndex = dayOfYear % posts.length;
  const featuredPost = posts[featuredIndex];

  return { featuredPost };
}
