-- Enable Row-Level Security on all application tables and create
-- per-user policies so that the Supabase anon key cannot be used
-- to read, edit, or delete another user's data.
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor).

-- ─── users ────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE TO authenticated
  USING (id = auth.uid());

-- ─── echo_entries ─────────────────────────────────────────────────

ALTER TABLE public.echo_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entries_select_own" ON public.echo_entries;
DROP POLICY IF EXISTS "entries_insert_own" ON public.echo_entries;
DROP POLICY IF EXISTS "entries_update_own" ON public.echo_entries;
DROP POLICY IF EXISTS "entries_delete_own" ON public.echo_entries;

CREATE POLICY "entries_select_own" ON public.echo_entries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "entries_insert_own" ON public.echo_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "entries_update_own" ON public.echo_entries
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "entries_delete_own" ON public.echo_entries
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
