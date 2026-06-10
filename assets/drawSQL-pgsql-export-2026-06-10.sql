-- Schema for briefsmith (mirrors supabase/migrations/20260610000000_create_briefs.sql)
-- briefs are owned by Supabase auth users; all access is enforced via RLS.

CREATE TABLE IF NOT EXISTS public.briefs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Untitled Brief',
  fields      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  score       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching a user's briefs sorted by newest first
CREATE INDEX briefs_user_id_created_at_idx
  ON public.briefs (user_id, created_at DESC);

-- Trigger keeps updated_at current on every UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER briefs_updated_at
  BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Row-level security: users can only see and modify their own rows
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own briefs"   ON public.briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own briefs" ON public.briefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own briefs" ON public.briefs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own briefs" ON public.briefs FOR DELETE USING (auth.uid() = user_id);
