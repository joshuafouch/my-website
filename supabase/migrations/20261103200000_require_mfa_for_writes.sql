-- Close the MFA bypass: author write policies used to accept aal1 (password-only) sessions,
-- so a stolen password plus the public anon key could write straight to the REST API.
--
-- Adds RESTRICTIVE policies (ANDed with the existing permissive "Author ..." policies) to every
-- write path: once a user has a verified MFA factor, their JWT must be aal2 to insert, update,
-- or delete. Users without a verified factor are unaffected, so this cannot lock out an account
-- that has not enrolled yet. Public reads are untouched.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- security definer so policies can read auth.mfa_factors without granting it to authenticated.
create or replace function private.mfa_satisfied()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
    or not exists (
      select 1
      from auth.mfa_factors f
      where f.user_id = (select auth.uid())
        and f.status = 'verified'
    );
$$;

revoke all on function private.mfa_satisfied() from public, anon;
grant execute on function private.mfa_satisfied() to authenticated;

do $$
declare
  t record;
begin
  -- Every RLS-enabled table in public, so tables created outside these migrations (posts,
  -- resume, music_*) are covered too.
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relrowsecurity
  loop
    execute format('drop policy if exists %I on public.%I', 'Require MFA insert', t.relname);
    execute format('drop policy if exists %I on public.%I', 'Require MFA update', t.relname);
    execute format('drop policy if exists %I on public.%I', 'Require MFA delete', t.relname);

    execute format(
      'create policy %I on public.%I as restrictive for insert to authenticated with check ((select private.mfa_satisfied()))',
      'Require MFA insert', t.relname
    );
    execute format(
      'create policy %I on public.%I as restrictive for update to authenticated using ((select private.mfa_satisfied())) with check ((select private.mfa_satisfied()))',
      'Require MFA update', t.relname
    );
    execute format(
      'create policy %I on public.%I as restrictive for delete to authenticated using ((select private.mfa_satisfied()))',
      'Require MFA delete', t.relname
    );
  end loop;
end
$$;

-- Storage uploads/overwrites/deletes for every bucket (portraits, blog-images, albums, resume).
drop policy if exists "Require MFA insert" on storage.objects;
drop policy if exists "Require MFA update" on storage.objects;
drop policy if exists "Require MFA delete" on storage.objects;

create policy "Require MFA insert"
  on storage.objects as restrictive for insert to authenticated
  with check ((select private.mfa_satisfied()));

create policy "Require MFA update"
  on storage.objects as restrictive for update to authenticated
  using ((select private.mfa_satisfied()))
  with check ((select private.mfa_satisfied()));

create policy "Require MFA delete"
  on storage.objects as restrictive for delete to authenticated
  using ((select private.mfa_satisfied()));
