-- Create the 'avatars' storage bucket for profile pictures.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor).

-- 1. Create bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (already on by default, but idempotent)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies on this bucket to avoid conflicts
DROP POLICY IF EXISTS "avatar_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_select_public" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;

-- 4. Allow authenticated users to upload files to their own folder
CREATE POLICY "avatar_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Allow public read access to all avatars
CREATE POLICY "avatar_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- 6. Allow users to update their own files
CREATE POLICY "avatar_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. Allow users to delete their own files
CREATE POLICY "avatar_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
