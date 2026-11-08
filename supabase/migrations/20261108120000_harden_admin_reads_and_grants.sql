-- Audit fixes (AUDIT.md M3, M5, L9).
--
-- M3: admin *reads* now need MFA too. 20261103200000 made every write require aal2 once a factor
-- is verified, but the admin-only SELECT policies (draft posts and projects, bucket listings) still
-- accepted a password-only (aal1) session, so a stolen password plus the public anon key could
-- read drafts and list every stored file straight from the REST API.
--
-- M5: least privilege for the API roles. posts (created in the dashboard) kept Supabase's default
-- ALL grants, including TRUNCATE, which RLS does not cover. The schema's default privileges also
-- exposed every future table, sequence and function to anon/authenticated; new objects now need
-- explicit grants, which every migration here already does.
--
-- L9: admin_storage_usage runs as the caller instead of as its owner. The admin can already read
-- every bucket (the "Author read" policies) and the database size, so it needs no extra rights.

-- M3 ------------------------------------------------------------------------------------------

alter policy "Author read all" on public.posts
  using ((select private.is_admin()) and (select private.mfa_satisfied()));

alter policy "Author read all" on public.projects
  using ((select private.is_admin()) and (select private.mfa_satisfied()));

do $$
declare
  b text;
begin
  foreach b in array array['albums', 'blog-images', 'portraits', 'resumes'] loop
    execute format(
      'alter policy %I on storage.objects using (bucket_id = %L and (select private.is_admin()) and (select private.mfa_satisfied()))',
      'Author read ' || b,
      b
    );
  end loop;
end
$$;

-- M5 ------------------------------------------------------------------------------------------

revoke all on table public.posts from public, anon, authenticated;
grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;
grant select, insert, update, delete on table public.posts to service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
-- Postgres itself grants EXECUTE on every new function to PUBLIC (which anon inherits), and only a
-- database-wide default can take that back. New functions need an explicit `grant execute`.
alter default privileges for role postgres
  revoke execute on functions from public;

-- L9 ------------------------------------------------------------------------------------------

create or replace function public.admin_storage_usage(bucket_ids text[])
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not (select private.is_admin()) or not (select private.mfa_satisfied()) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'database_bytes', pg_database_size(current_database()),
    'buckets', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('bucket', s.bucket_id, 'bytes', s.bytes, 'objects', s.objects)
          order by s.bytes desc
        )
        from (
          select o.bucket_id,
            coalesce(sum((o.metadata ->> 'size')::bigint), 0) as bytes,
            count(*)::int as objects
          from storage.objects o
          where o.bucket_id = any (bucket_ids)
          group by o.bucket_id
        ) s
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.admin_storage_usage(text[]) from public, anon;
grant execute on function public.admin_storage_usage(text[]) to authenticated;
