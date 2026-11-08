import { asset } from '$app/paths';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

export const RESUME_BUCKET = 'resumes';

export type Resume = {
  url: string;
  filename: string;
  uploaded: boolean;
  updatedAt: string | null;
};

const fallback: Resume = {
  url: asset('assets/jf_resume26-27.pdf'),
  filename: 'jf_resume.pdf',
  uploaded: false,
  updatedAt: null
};

export async function loadResume(supabase: Client): Promise<Resume> {
  const { data, error } = await supabase
    .from('resume')
    .select('path, filename, updated_at')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load resume', error);
    return fallback;
  }

  if (!data?.path) return fallback;

  const { data: file } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(data.path);
  const version = encodeURIComponent(data.updated_at);
  return {
    url: `${file.publicUrl}?v=${version}`,
    filename: data.filename,
    uploaded: true,
    updatedAt: data.updated_at
  };
}
