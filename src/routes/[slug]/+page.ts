import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const post = await import(`../../posts/${params.slug}.md`);

    return {
      content: post.default,
      meta: { ...post.metadata, type: 'post' }
    };
  } catch (e) {
    try {
      const project = await import(`../../projects/${params.slug}.md`);

      return {
        content: project.default,
        meta: { ...project.metadata, type: 'project' }
      };
    } catch (e) {
      error(404, `Could not find ${params.slug}`);
    }
  }
}
