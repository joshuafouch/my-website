-- One place for the admin identity in SQL. Every "Author ..." policy (tables and storage) and
-- admin_storage_usage() compared the JWT email against a hardcoded address; they now call
-- private.is_admin() instead. To change the admin, update this function AND the ADMIN_EMAIL env
-- var (used by the app's isAdminEmail); both compare case-insensitively.

create or replace function private.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt()) ->> 'email', '')) = lower('joshie.fouchie@gmail.com');
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Rewrite every policy that inlines the admin email. Each one is either "<email check>" or
-- "bucket_id = '<bucket>' AND <email check>"; the bucket condition is preserved.
do $$
declare
  p record;
  bucket text;
  cond text;
  sql text;
begin
  for p in
    select schemaname, tablename, policyname, cmd, coalesce(qual, '') || coalesce(with_check, '') as expr
    from pg_policies
    where coalesce(qual, '') || coalesce(with_check, '') like '%joshie.fouchie@gmail.com%'
  loop
    bucket := (regexp_match(p.expr, 'bucket_id = ''([^'']+)''::text'))[1];
    cond := case
      when bucket is null then '(select private.is_admin())'
      else format('bucket_id = %L and (select private.is_admin())', bucket)
    end;

    sql := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    sql := sql || case p.cmd
      when 'INSERT' then format(' with check (%s)', cond)
      when 'UPDATE' then format(' using (%s) with check (%s)', cond, cond)
      else format(' using (%s)', cond)
    end;
    execute sql;
  end loop;
end
$$;

-- admin_storage_usage: same body, admin check via private.is_admin().
create or replace function public.admin_storage_usage(bucket_ids text[])
returns jsonb
language plpgsql
stable
security definer
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
