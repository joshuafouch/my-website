import { marked } from 'marked';

marked.setOptions({
	gfm: true,
	breaks: false
});

export async function renderMarkdown(markdown: string): Promise<string> {
	return marked.parse(markdown);
}
