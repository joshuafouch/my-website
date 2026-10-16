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
	sourceUrl?: string;
	tags?: string[];
	published: boolean;
};
