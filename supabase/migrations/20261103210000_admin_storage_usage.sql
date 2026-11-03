-- Database size and per-bucket storage totals for the admin Supabase dashboard.
--
-- Replaces raw SQL sent through the Management API's /database/query endpoint, which required a
-- personal access token with database (write-capable) access. The dashboard now calls this RPC
-- with the admin's own session, so the PAT only needs Usage Analytics: Read + Disk Config: Read.
--
-- security definer: reads pg_database_size and storage.objects across all buckets. Guarded so only
-- the admin (same email check as the "Author ..." policies) with MFA satisfied can call it.

create or replace function public.admin_storage_usage(bucket_ids text[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt()) ->> 'email', '') <> 'joshie.fouchie@gmail.com'
    or not (select private.mfa_satisfied()) then
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
