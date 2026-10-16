import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseMarkdown(filePath, slug) {
	const raw = readFileSync(filePath, 'utf8');
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) throw new Error(`No frontmatter in ${filePath}`);

	const frontmatter = match[1];
	const body = match[2].trim();

	const get = (key) => {
		const line = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
		return line?.[1]?.replace(/^['"]|['"]$/g, '').trim() ?? '';
	};

	const categoriesMatch = frontmatter.match(/categories:\n((?:\s+-\s+.+\n?)+)/);
	const categories = categoriesMatch
		? categoriesMatch[1]
				.split('\n')
				.map((line) => line.replace(/^\s*-\s*/, '').trim())
				.filter(Boolean)
		: [];

	return {
		slug,
		title: get('title'),
		description: get('description'),
		date: get('date'),
		image: get('image'),
		published: get('published') === 'true',
		categories,
		body
	};
}

function sqlString(value) {
	return `'${value.replaceAll("'", "''")}'`;
}

function sqlArray(values) {
	return `ARRAY[${values.map(sqlString).join(', ')}]::text[]`;
}

const posts = [
	parseMarkdown(join(root, 'src/posts/Junior_Thesis.md'), 'Junior_Thesis'),
	parseMarkdown(join(root, 'src/posts/Senior_Thesis.md'), 'Senior_Thesis')
];

const values = posts
	.map((post) => {
		const tag = `body_${post.slug}`;
		return `(
  ${sqlString(post.slug)},
  ${sqlString(post.title)},
  ${sqlString(post.description)},
  ${sqlString(post.date)}::date,
  ${sqlArray(post.categories)},
  ${sqlString(post.image)},
  $${tag}$${post.body}$${tag}$,
  ${post.published}
)`;
	})
	.join(',\n');

const sql = `insert into public.posts (slug, title, description, date, categories, image, body, published)
values
${values}
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  date = excluded.date,
  categories = excluded.categories,
  image = excluded.image,
  body = excluded.body,
  published = excluded.published,
  updated_at = now();
`;

const out = join(root, 'scripts/seed-posts.sql');
writeFileSync(out, sql);
console.log(`Wrote ${out}`);
