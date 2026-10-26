import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import { RESUME_BUCKET } from '#lib/resume.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';

type Client = SupabaseClient<Database>;

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const RESUME_PATH = 'current.pdf';

export async function uploadResume(
  supabase: Client,
  file: File,
  filename: string
): Promise<{ ok: true } | { error: string }> {
  await requireAdmin(supabase);

  if (file.size === 0) return { error: 'Choose a PDF to upload.' };
  if (file.type !== 'application/pdf') return { error: 'The resume must be a PDF.' };
  if (file.size > MAX_RESUME_BYTES) return { error: 'The resume must be 10 MB or smaller.' };

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(RESUME_PATH, file, {
      contentType: 'application/pdf',
      cacheControl: '60',
      upsert: true
    });

  if (uploadError) {
    console.error('Failed to upload resume', uploadError);
    return { error: uploadError.message };
  }

  const name = filename.trim().replace(/[^\w.-]+/g, '_') || 'jf_resume.pdf';
  const { error: dbError } = await supabase.from('resume').upsert({
    id: 1,
    path: RESUME_PATH,
    filename: name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`,
    updated_at: new Date().toISOString()
  });

  if (dbError) {
    console.error('Failed to save resume pointer', dbError);
    return { error: 'Uploaded the PDF but could not point the site at it.' };
  }

  return { ok: true };
}
