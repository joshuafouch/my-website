import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

export type Org = { name: string; href: string };
export type Portrait = { id: string; src: string; alt: string };
export type Job = {
  id: string;
  role: string;
  timeSpan: string;
  body: string;
  skills: string[];
  orgs: Org[];
};
export type TechItem = { text: string; href: string };
export type TechGroup = { id: string; title: string; items: TechItem[] };
export type MusicEntry = {
  id: string;
  title: string;
  artist: string;
  note: string;
  url: string;
};

export type ProfessionalContent = {
  intro: string;
  workIntro: string;
  techIntro: string;
  portraits: Portrait[];
  jobs: Job[];
  groups: TechGroup[];
};

export type PersonalContent = {
  intro: string;
  youtubeUrl: string;
  music: MusicEntry[];
};

function readOrgs(value: Json): Org[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const href = typeof item.href === 'string' ? item.href.trim() : '';
    if (!name) return [];
    return [{ name, href }];
  });
}

function readItems(value: Json): TechItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    const href = typeof item.href === 'string' ? item.href.trim() : '';
    if (!text) return [];
    return [{ text, href }];
  });
}

export async function loadProfessional(supabase: Client): Promise<ProfessionalContent> {
  const [profile, portraits, work, groups] = await Promise.all([
    supabase
      .from('about_professional')
      .select('intro, work_intro, tech_intro')
      .eq('id', 1)
      .maybeSingle(),
    supabase.from('portraits').select('id, src, alt, sort_order').order('sort_order'),
    supabase
      .from('work_experiences')
      .select('id, role, time_span, body, skills, orgs, sort_order')
      .order('sort_order'),
    supabase.from('tech_groups').select('id, title, items, sort_order').order('sort_order')
  ]);

  if (profile.error || portraits.error || work.error || groups.error) {
    console.error(
      'Failed to load professional about',
      profile.error,
      portraits.error,
      work.error,
      groups.error
    );
    error(500, 'Failed to load the about page');
  }

  return {
    intro: profile.data?.intro ?? '',
    workIntro: profile.data?.work_intro ?? '',
    techIntro: profile.data?.tech_intro ?? '',
    portraits: (portraits.data ?? []).map((portrait) => ({
      id: portrait.id,
      src: portrait.src,
      alt: portrait.alt
    })),
    jobs: (work.data ?? []).map((job) => ({
      id: job.id,
      role: job.role,
      timeSpan: job.time_span,
      body: job.body,
      skills: job.skills ?? [],
      orgs: readOrgs(job.orgs)
    })),
    groups: (groups.data ?? []).map((group) => ({
      id: group.id,
      title: group.title,
      items: readItems(group.items)
    }))
  };
}

export async function loadPersonal(supabase: Client): Promise<PersonalContent> {
  const [profile, music] = await Promise.all([
    supabase.from('about_personal').select('intro, youtube_url').eq('id', 1).maybeSingle(),
    supabase
      .from('music_entries')
      .select('id, title, artist, note, url, sort_order')
      .order('sort_order')
  ]);

  if (profile.error || music.error) {
    console.error('Failed to load personal about', profile.error, music.error);
    error(500, 'Failed to load the about page');
  }

  return {
    intro: profile.data?.intro ?? '',
    youtubeUrl: profile.data?.youtube_url ?? '',
    music: (music.data ?? []).map((entry) => ({
      id: entry.id,
      title: entry.title,
      artist: entry.artist,
      note: entry.note,
      url: entry.url ?? ''
    }))
  };
}
