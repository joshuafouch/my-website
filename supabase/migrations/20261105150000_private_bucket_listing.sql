-- Public buckets serve files by URL (/storage/v1/object/public/...) without any SELECT policy on
-- storage.objects. The blanket "Public read <bucket>" policies only added the ability for anyone
-- to list and enumerate every object through the API. Listing is now admin-only.
-- The admin still needs SELECT for list(), remove() and upsert uploads (resume).

do $$
declare
  b text;
begin
  foreach b in array array['albums', 'blog-images', 'portraits', 'resumes'] loop
    execute format('drop policy if exists %I on storage.objects', 'Public read ' || b);
    execute format(
      'create policy %I on storage.objects for select to authenticated using (bucket_id = %L and (select private.is_admin()))',
      'Author read ' || b,
      b
    );
  end loop;
end
$$;

-- blog-images accepted image/* (including image/svg+xml, which can carry script). Match the
-- app's allowlist and the other image buckets.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'blog-images';
