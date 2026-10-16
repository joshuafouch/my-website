import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import type { Post } from '#lib/types.ts';

type Client = SupabaseClient<Database>;

const listColumns = 'title, slug, description, date, categories, image, published' as const;

export async function getPublishedPosts(supabase: Client): Promise<Post[]> {
	const { data, error: dbError } = await supabase
		.from('posts')
		.select(listColumns)
		.eq('published', true)
		.order('date', { ascending: false });

	if (dbError) {
		console.error('Failed to load posts', dbError);
		error(500, 'Failed to load posts');
	}

	return (data ?? []).map((post) => ({
		...post,
		image: post.image ?? '',
		categories: post.categories ?? []
	}));
}

export async function getPublishedPostBySlug(supabase: Client, slug: string) {
	const { data, error: dbError } = await supabase
		.from('posts')
		.select('*')
		.eq('slug', slug)
		.eq('published', true)
		.maybeSingle();

	if (dbError) {
		console.error('Failed to load post', dbError);
		error(500, 'Failed to load post');
	}

	return data;
}
